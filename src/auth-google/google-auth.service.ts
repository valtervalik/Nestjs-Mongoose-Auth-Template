import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { Model } from 'mongoose';
import { AuthenticationService } from 'src/auth/authentication/authentication.service';
import { TypedEventEmitter } from 'src/common/types/typed-event-emitter/typed-event-emitter.class';
import { AllConfigType } from 'src/config/config.type';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class GoogleAuthService {
  private oauthClient: OAuth2Client;

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly authenticationService: AuthenticationService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly eventEmitter: TypedEventEmitter,
  ) {
    const clientId = this.configService.get('google.clientId', { infer: true });
    const clientSecret = this.configService.get('google.clientSecret', {
      infer: true,
    });
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
