import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CalendlyService } from './calendly.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { Buffer } from 'buffer';
import axios from 'axios';
import { User } from '../../user.module/user/user.model';
import ApiError from '../../../errors/ApiError';

export class CalendlyController  {
  calendlyService = new CalendlyService();


  redirectToCalendlyAuth = catchAsync(async (req: Request, res: Response) => {
    
    // Optional: Pass user ID in state for validation (base64 encoded)
    const state = Buffer.from(JSON.stringify({ 
      userId: req.user.userId, 
      timestamp: Date.now() 
    })).toString('base64');

    console.log("state :: ", state);
    
    const authUrl = this.calendlyService.getAuthUrl(state);

    console.log("authUrl :: ", authUrl)

    // res.redirect(authUrl);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: authUrl,
      message: `url received successfully`,
      success: true,
    });
  });


  deleteWebhookSubscription = catchAsync(async (req: Request, res: Response) => {
    
    const tokenWithBearer = req.headers.authorization;
    let token;
    if (tokenWithBearer.startsWith('Bearer')) {
      token = tokenWithBearer.split(' ')[1];
    }

    console.log("token", token);

    let userDetails = await this.calendlyService.getUserDetails("eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzcxMjIzODIwLCJqdGkiOiIwYTJjOGI1OS1jNTczLTRlMmItOGVlMy0xYjg5NDk4NDM0ZDMiLCJ1c2VyX3V1aWQiOiJmYzQyNWFiZi04MzQ4LTRlMTQtYTAzMi0yMGM3YWFlMTI5YWEiLCJhcHBfdWlkIjoiVWZYWlI3YzMybXlSUmJmWnFhX21jNjh2emg2WWpvTkZOYlVoSHFoQ21QbyIsInNjb3BlIjoiZGVmYXVsdCIsImV4cCI6MTc3MTIzMTAyMH0.IEyf8ostzbmzDnKlgCKlgdDqBan-s0mRh-vcJp3Zrje_DZH7XWY_UbGQ1DQKGemi6zTEaq6Nx-aaImG6CouqAQ")
    
    console.log("userDetails :: ", userDetails);

    // const webhookId = webhookUri.split('/').pop();

    // await axios.delete(
    //   `https://api.calendly.com/webhook_subscriptions/fc425abf-8348-4e14-a032-20c7aae129aa`,
    //   {
    //     headers: {
    //       Authorization: `Bearer eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzcxMjIzODIwLCJqdGkiOiIwYTJjOGI1OS1jNTczLTRlMmItOGVlMy0xYjg5NDk4NDM0ZDMiLCJ1c2VyX3V1aWQiOiJmYzQyNWFiZi04MzQ4LTRlMTQtYTAzMi0yMGM3YWFlMTI5YWEiLCJhcHBfdWlkIjoiVWZYWlI3YzMybXlSUmJmWnFhX21jNjh2emg2WWpvTkZOYlVoSHFoQ21QbyIsInNjb3BlIjoiZGVmYXVsdCIsImV4cCI6MTc3MTIzMTAyMH0.IEyf8ostzbmzDnKlgCKlgdDqBan-s0mRh-vcJp3Zrje_DZH7XWY_UbGQ1DQKGemi6zTEaq6Nx-aaImG6CouqAQ`,
    //     },
    //   }
    // );


    sendResponse(res, {
      code: StatusCodes.OK,
      data: null,
      message: `account removed successfully`,
      success: true,
    });
  });


  disconnectCalendly = catchAsync(async (req: Request, res: Response) => {

    const {  organization } = req.query;

    // 1. get user from DB
    const user = await User.findById(req.user.userId).select('calendly ');

    const accessToken = await this.calendlyService.getValidAccessToken(req.user.userId);

    // 2️⃣ delete webhooks FIRST
    await this.calendlyService.deleteAllWebhooks(accessToken, organization);

    // 3. ✅ clear calendly data from DB
    await User.findByIdAndUpdate(req.user.userId, {
      $set: {
        'calendly.disconnectedAt': new Date(),
      },
      $unset: {
        'calendly.encryptedAccessToken': '',
        'calendly.refreshToken': '',
        'calendly.userUri': '',
        'calendly.organizationUri': '',
        'calendly.profileUrl': '',
        'calendly.expiresAt': '',
      },
    });

    sendResponse(res, {
      code: StatusCodes.OK,
      success: true,
      message: "Calendly disconnected successfully",
      data: null,
    });
  });


  getScheduledEvents = catchAsync(async (req: Request, res: Response) => {

    // ✅ always get a valid (possibly refreshed) token
    const accessToken = await this.calendlyService.getValidAccessToken(req.user.userId);

    const me = await axios.get(
        'https://api.calendly.com/users/me',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );


    console.log("me :: ", me);  

    const userUri = me.data.resource.uri;

    const data = await this.calendlyService.getScheduledEvents(
      accessToken,
      userUri
    );

    const user = await User.findById(req.user.userId).select('calendly name role');
    console.log("user =>getScheduledEvents> ", user);

    sendResponse(res, {
      code: StatusCodes.OK,
      success: true,
      message: "Upcoming scheduled events list retrive successfully",
      data: data,
    });
  });

  getEventTypes = catchAsync(async (req: Request, res: Response) => {


    const accessToken = await this.calendlyService.getValidAccessToken(req.user.userId);

    const user = await User.findById(req.user.userId).select('calendly name role');



    // if (!user?.calendly?.encryptedAccessToken) {
    //   throw new ApiError(StatusCodes.UNAUTHORIZED, 'Calendly not connected');
    // }

    const me = await axios.get(
      'https://api.calendly.com/users/me',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );


    // console.log("me :: ", me);  

    const userUri = me.data.resource.uri;

    const data = await this.calendlyService.getEventTypes(
      accessToken,
      userUri
    );

    console.log("user =>getEventTypes> ", user);

    sendResponse(res, {
      code: StatusCodes.OK,
      success: true,
      message: 'Event types retrieved successfully',
      data,
    });
  });

  getEventInvitees = catchAsync(async (req: Request, res: Response) => {
    const { eventUuid } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId).select('calendly name role');

    if (!user?.calendly?.encryptedAccessToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Calendly not connected');
    }

    const data = await this.calendlyService.getEventInvitees(
      user.calendly.encryptedAccessToken,
      eventUuid
    );

    console.log("user =>getEventInvitees> ", user);

    sendResponse(res, {
      code: StatusCodes.OK,
      success: true,
      message: 'Event invitees retrieved successfully',
      data,
    });
  });

/*
  async disconnectCalendly(accessToken: string, webhookUri: string) {
  const webhookId = webhookUri.split('/').pop();

  await axios.delete(
    `https://api.calendly.com/webhook_subscriptions/${webhookId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

*/

  // add more methods here if needed or override the existing ones 
}
