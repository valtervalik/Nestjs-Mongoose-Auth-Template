import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { AuthenticationService } from '../../authentication.service';

@Injectable()
export class GoogleAuthService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly authenticationService: AuthenticationService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  onModuleInit() {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
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
