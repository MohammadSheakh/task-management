//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { OAuthAccount } from './oauthAccount.model';
import { IOAuthAccount, OAuthPayload } from './oauthAccount.interface';
import { GenericService } from '../../_generic-module/generic.services';
//@ts-ignore
import { OAuth2Client } from 'google-auth-library';
//@ts-ignore
import appleSignin from 'apple-signin-auth';
import { TAuthProvider } from '../../auth/auth.constants';

export class OAuthAccountService extends GenericService<
  typeof OAuthAccount,
  IOAuthAccount
> {
  constructor() {
    super(OAuthAccount);
  }

  //@ts-ignore
  private static googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async verifyGoogleToken(idToken: string): Promise<OAuthPayload> {
    const ticket = await OAuthAccountService.googleClient.verifyIdToken({
      idToken,
      //@ts-ignore
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const p = ticket.getPayload()!;

    console.log("p ======> 🆕🆕", p)
    // { sub: providerId, email, email_verified: isEmailVerified }

    return { provider: TAuthProvider.google, providerId: p.sub, email: p.email!, name: p.name, picture: p.picture };
  };

  async verifyAppleToken (identityToken: string): Promise<OAuthPayload> {
    const p = await appleSignin.verifyIdToken(identityToken, {
      //@ts-ignore
      audience: process.env.APPLE_CLIENT_ID,
      ignoreExpiration: false,
    });
    return { provider: TAuthProvider.apple, providerId: p.sub, email: p.email!, name: p.name };
  };


  
}
