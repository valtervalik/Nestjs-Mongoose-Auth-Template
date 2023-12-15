import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { authenticator } from 'otplib';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class OtpAuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async generateSecret(email: string) {
    const secret = authenticator.generateSecret();
    const appName = this.configService.getOrThrow('TFA_APP_NAME');
    const uri = authenticator.keyuri(email, appName, secret);

    return { secret, uri };
  }

  verifyCode(code: string, secret: string) {
    return authenticator.verify({ token: code, secret });
  }

  async enableTFAForUser(email: string, secret: string) {
    const { _id } = await this.userModel.findOne({ email });
    await this.userModel.updateOne(
      { _id },
      //In the real world the secret would be encrypted
      { tfaSecret: secret, isTFAEnabled: true },
    );
  }
}
