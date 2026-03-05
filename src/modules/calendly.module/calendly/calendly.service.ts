import { StatusCodes } from 'http-status-codes';
import axios from 'axios';
import dotenv from 'dotenv';
import { User } from '../../user.module/user/user.model';
import ApiError from '../../../errors/ApiError';

dotenv.config();

export class CalendlyService{
  
  const CALENDLY_API = 'https://api.calendly.com';

  // Get OAuth authorization URL
  getAuthUrl(state = '') {
    const params = new URLSearchParams({
      client_id: process.env.CALENDLY_CLIENT_ID,
      redirect_uri: process.env.CALENDLY_REDIRECT_URI,
      state,
      response_type: 'code'
    });
    return `https://auth.calendly.com/oauth/authorize?${params.toString()}`;
  }

  // Exchange code for tokens
  async getAccessToken(code: string) {
    const response = await axios.post('https://auth.calendly.com/oauth/token', {
      grant_type: 'authorization_code',
      code,
      client_id: process.env.CALENDLY_CLIENT_ID,
      client_secret: process.env.CALENDLY_CLIENT_SECRET,
      redirect_uri: process.env.CALENDLY_REDIRECT_URI
    });
    
    return response.data; // { access_token, token_type, expires_in, refresh_token?, scope, calendly_user_uuid, organization_uuid }
  }

  // Create webhook subscription
  async createWebhookSubscription(accessToken: string, userUri:string) {

    // TRIM EVERYTHING
    const webhookUrl = (process.env.CALENDLY_WEBHOOK_URL || '').trim();
    const cleanUserUri = (userUri || '').trim();
    const endpointUrl = 'https://api.calendly.com/webhook_subscriptions'.trim();

    
    const me = await axios.get(
        'https://api.calendly.com/users/me',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // const userUri = me.data.resource.uri;
      const organizationUri = me.data.resource.current_organization;


    let response;
    try{
         response = await axios.post(
        `https://api.calendly.com/webhook_subscriptions`.trim(),
        {
          url: webhookUrl,
          events: ['invitee.created', 'invitee.canceled'],
          //signing_key: process.env.CALENDLY_WEBHOOK_SIGNING_KEY,
          //organization: null, // User-level webhook
          scope: 'user',
          user : cleanUserUri,
          
          organization: organizationUri
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      // console.log("response from calendly.service.ts =>⚡⚡> ", response);
      
    }catch(error){
      console.error("Calendly ERROR DETAILS:", error?.response?.data);
      throw error;
    }
    
    return response.data.resource; // { uri, id, ... }
  }

  // Delete webhook subscription
  async deleteWebhookSubscription(webhookId: string, accessToken: string) {
    await axios.delete(
      `${this.CALENDLY_API}/webhook_subscriptions/${webhookId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  }

  // Get user details (for profile URL)
  async getUserDetails(accessToken: string) {
    const response = await axios.get(
      `${this.CALENDLY_API}/users/me`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data.resource;
  }

  //=============================  Upcoming scheduled events list  =====================

  async getScheduledEvents(accessToken: string, userUri: string) {
    const res = await axios.get(`https://api.calendly.com/scheduled_events`, {
      params: {
        user: userUri,
        sort: 'start_time:desc',  // most recent first
        count: 20,                // adjust as needed
        // status: 'active',      // uncomment to filter only active bookings
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      events: res.data.collection,
      pagination: res.data.pagination, // has next_page_token if needed
    };
  }

  // service
  async getEventInvitees(accessToken: string, eventUuid: string) {
    const res = await axios.get(
      `https://api.calendly.com/scheduled_events/${eventUuid}/invitees`,
      {
        params: {
          count: 20,
          status: 'active', // remove this to include cancelled invitees too
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return {
      invitees: res.data.collection,
      pagination: res.data.pagination,
    };
  }

  async getEventTypes(accessToken: string, userUri: string) {
    const res = await axios.get('https://api.calendly.com/event_types', {
      params: {
        user: userUri,
        active: true,
        count: 20,
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      eventTypes: res.data.collection,
      pagination: res.data.pagination,
    };
  }


  //=============================  Get new accessToken By refreshToken  =====================


  async getValidAccessToken(userId: string) {
    const user = await User.findById(userId).select('calendly');

    if (!user?.calendly?.encryptedAccessToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Calendly not connected');
    }

    const isExpired = user.calendly.expiresAt
      ? new Date() >= new Date(user.calendly.expiresAt)
      : false;

    if (isExpired) {
      console.log('Access token expired, refreshing...');
      return await this.refreshAccessToken(userId, user.calendly.refreshToken);
    }

    return user.calendly.encryptedAccessToken;
  }

  async refreshAccessToken(userId: string, refreshToken: string) {
    const res = await axios.post(
      'https://auth.calendly.com/oauth/token',
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.CALENDLY_CLIENT_ID,
        client_secret: process.env.CALENDLY_CLIENT_SECRET,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { access_token, refresh_token, expires_in } = res.data;

    // Save new tokens to DB
    await User.findByIdAndUpdate(userId, {
      'calendly.encryptedAccessToken': access_token,
      'calendly.refreshToken': refresh_token,
      'calendly.expiresAt': new Date(Date.now() + expires_in * 1000),
    });

    return access_token;
  }


  //=============================  Delete Things  =====================

  // -----------------------------
  // GET ALL WEBHOOKS
  // -----------------------------
  async getWebhookSubscriptions(accessToken: string, organization: string) {
    const orgUrn = `https://api.calendly.com/organizations/${organization}`;


    const me = await axios.get(
        'https://api.calendly.com/users/me',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

    const userUri = me.data.resource.uri;


    const res = await axios.get(
      `https://api.calendly.com/webhook_subscriptions`,
      {
        params: {
          scope: 'user',
          organization: orgUrn, // e.g. https://api.calendly.com/organizations/XXX
          user: userUri,                 // e.g. https://api.calendly.com/users/XXX
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    console.log("Webhook Subscriptions :: ", res.data.collection);

    return res.data.collection || [];
  }

  // -----------------------------
  // DELETE SINGLE WEBHOOK
  // -----------------------------
  async deleteWebhook(accessToken: string, webhookUri: string) {
    const id = webhookUri.split("/").pop();

    if (!id) return;

    try {
      await axios.delete(
        `https://api.calendly.com/webhook_subscriptions/${id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    } catch (err: any) {
      // already deleted OR token expired
      if (err.response?.status !== 404 && err.response?.status !== 401) {
        throw err;
      }
    }
  }

  // -----------------------------
  // DELETE ALL WEBHOOKS
  // -----------------------------
  async deleteAllWebhooks(accessToken: string, organization: string) {
    const hooks = await this.getWebhookSubscriptions(accessToken, organization);

    console.log("hooks ", hooks);

    for (const hook of hooks) {
      await this.deleteWebhook(accessToken, hook.uri);
    }
  }
}
