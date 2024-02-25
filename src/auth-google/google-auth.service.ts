import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { Model } from 'mongoose';
import { AuthenticationService } from 'src/auth/authentication/authentication.service';
import { TypedEventEmitter } from 'src/common/types/typed-event-emitter/typed-event-emitter.class';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import googleConfig from './config/google.config';

@Injectable()
export class GoogleAuthService {
  private oauthClient: OAuth2Client;

  constructor(
    @Inject(googleConfig.KEY)
    private readonly googleConfiguration: ConfigType<typeof googleConfig>,
    private readonly authenticationService: AuthenticationService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly eventEmitter: TypedEventEmitter,
  ) {
    const clientId = this.googleConfiguration.clientId;
    const clientSecret = this.googleConfiguration.clientSecret;
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  async authenticate(token: string, response: Response) {
    try {
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: token,
      });
      const { email, sub: googleId } = loginTicket.getPayload();

      const user = await this.userModel.findOne({ googleId });
      if (user) {
        return this.authenticationService.generateTokens(user, response);
      } else {
        const newUser = new this.userModel({ email, googleId });
        await newUser.save();

        this.eventEmitter.emit('user.welcome', {
          email: newUser.email,
        });

        return this.authenticationService.generateTokens(newUser, response);
      }
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictException('Email already in use');
      }

      throw new UnauthorizedException();
    }
  }
}
