//@ts-ignore
import { Request, Response } from 'express';
import { Secret } from 'jsonwebtoken';
//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { CalendlyService } from './calendly/calendly.service';
import { User } from '../user.module/user/user.model';
import { encrypt } from '../../services/calendly.service';
import { handleInviteeCreated } from './webhookHandlers/handleInviteeCreated';
import { handleInviteeCanceled } from './webhookHandlers/handleMeetingCanceled';
import { TokenService } from '../token/token.service';
import { config } from '../../config';
import { TokenType } from '../token/token.interface';

const calendlyService = new CalendlyService();

/*-─────────────────────────────────
|  💎✨🔍 -> V2 Found which is corrected 
└──────────────────────────────────*/
export const calendlyOAuthCallbackHandler = async (req: Request, res: Response): Promise<void> => {
     try {
          const { code, state } = req.query;

          console.log("code .. state .. ", code, " -- ", state);
          
          // Validate state (prevent CSRF)
          if (!state) throw new Error('Invalid state parameter');
          const stateData = JSON.parse(Buffer.from(state, 'base64').toString());

          console.log("stateData =>> " , stateData);
          
          // if (stateData.userId !== req.user.id) throw new Error('State mismatch');

          if (Date.now() - stateData.timestamp > 10 * 60 * 1000) throw new Error('State expired');
          
          // Exchange code for tokens
          const tokenData = await calendlyService.getAccessToken(code);

          console.log("tokenData :: ", tokenData);

          const userDetails = await calendlyService.getUserDetails(tokenData.access_token);
          

          console.log("userDetails :: ", userDetails);
     
         

          // Create webhook subscription
          const webhook = await calendlyService.createWebhookSubscription(tokenData.access_token, userDetails.uri);
          
          console.log("webhook :: ", webhook);

          
          const userId = stateData.userId; // ✅ your DB userId

          // Update user record (ENCRYPT token before saving!)
          const updatedUser = await User.findByIdAndUpdate(
               userId,
               {
                    $set: {
                         'calendly.userId': tokenData.owner,
                         'calendly.organizationId': tokenData.organization,
                         'calendly.encryptedAccessToken': tokenData.access_token, // need to store hashed 
                         'calendly.webhookSubscriptionId': webhook.uri,
                         'calendly.refreshToken': tokenData.refresh_token,
                         'calendly.profileUrl': userDetails.scheduling_url,
                         'calendly.connectedAt': new Date(),
                         'calendly.disconnectedAt': null,
                    }
               },
               { new: true, runValidators: true }
          );
          
          // Success redirect
          res.redirect(`/dashboard?calendly=connected&name=${encodeURIComponent(userDetails.name)}`);
     
     } catch (error) {
          console.error('Calendly OAuth error:', error);
          res.redirect(`/dashboard?calendly=error&message=${encodeURIComponent(error.message)}`);
     }
};


export const calendlyOAuthCallbackHandlerV2 = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code, state } = req.query;

    // 1. validate state
    if (!state) throw new Error('Invalid state parameter');

    const stateData = JSON.parse(
      Buffer.from(state as string, 'base64').toString('utf-8')
    );

    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      throw new Error('State expired');
    }

    const userId = stateData.userId;

    // 2. exchange code for tokens
    const tokenData = await calendlyService.getAccessToken(code as string);
    console.log('tokenData ::', tokenData);

    // 3. get user details from Calendly
    const userDetails = await calendlyService.getUserDetails(
      tokenData.access_token
    );
    console.log('userDetails ::', userDetails);

    // 4. create webhook subscription
    const webhook = await calendlyService.createWebhookSubscription(
      tokenData.access_token,
      userDetails.uri
    );
    console.log('webhook ::', webhook);

    // 5. ✅ save everything to DB
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          // ✅ store full URIs — needed for all API calls
          'calendly.userUri': userDetails.uri,
          'calendly.organizationUri': userDetails.current_organization,

          // tokens
          'calendly.encryptedAccessToken': tokenData.access_token,
          'calendly.refreshToken': tokenData.refresh_token,
          'calendly.expiresAt': new Date(Date.now() + tokenData.expires_in * 1000), // ✅

          // meta
          'calendly.webhookSubscriptionUri': webhook?.uri || null,
          'calendly.profileUrl': userDetails.scheduling_url,
          'calendly.connectedAt': new Date(),
          'calendly.disconnectedAt': null,
        },
      },
      { new: true, runValidators: true }
    );

    // TODO : We need to provide proper front end URL .. or we need to make a nice ejs page in backend .. with return to home button
    // 6. redirect to frontend
    res.redirect(
      `${process.env.FRONTEND_URL}/dashboard?calendly=connected&name=${encodeURIComponent(userDetails.name)}`
    );

  } catch (error) {
    console.error('Calendly OAuth error:', error);
    res.redirect(
      `${process.env.FRONTEND_URL}/dashboard?calendly=error&message=${encodeURIComponent(error.message)}`
    );
  }
};

export const calendlyWebHookHandler = async (req: Request, res: Response): Promise<void> => {
     // ALWAYS return 200 to prevent Calendly retries
     res.status(200).json({ received: true });
     
     try {
          const { event, payload } = req.body;
          
          // Extract Calendly user UUID from event URI
          // Example: "https://api.calendly.com/users/abcd-1234-efgh" -> "abcd-1234-efgh"
          const calendlyUserId = payload.event.user.split('/').pop();
          
          // Find user by Calendly ID (critical routing step!)
          const user = await User.findOne({
               'calendly.userId': calendlyUserId,
               isDeleted: false,
               'calendly.disconnectedAt': null
          });
          
          if (!user) {
               console.warn(`⚠️ Webhook for unknown Calendly user: ${calendlyUserId}`);
               return;
          }
          
          // Process event based on type
          switch (event) {
               case 'invitee.created':
                    console.log("🪝🪝 invitee.created 🪝🪝")

                    await handleInviteeCreated(user, payload);
                    break;
               
               case 'invitee.canceled':
                    console.log("🪝🪝 invitee.canceled 🪝🪝")

                    await handleInviteeCanceled(payload);
                    break;
                    
               default:
                    console.log(`Unhandled Calendly event: ${event}`);
          }
     } catch (error) {
     console.error('Webhook processing error:', error);
     // DO NOT throw - we already sent 200 response
     }
};
