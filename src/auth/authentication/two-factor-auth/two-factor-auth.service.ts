import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { authenticator } from 'otplib';
import { EncryptingService } from 'src/common/encrypting/encrypting.service';
import { AllConfigType } from 'src/config/config.type';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly encryptingService: EncryptingService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    this.encryptingService.setKeys(
      this.configService.get('crypto.privateKey', { infer: true }),
      this.configService.get('crypto.publicKey', { infer: true }),
    );
  }

  async generateSecret(email: string) {
    const secret = authenticator.generateSecret();
    const appName = this.configService.getOrThrow('app.name', { infer: true });
    const uri = authenticator.keyuri(email, appName, secret);

    return { secret, uri };
  }

  async verifyCode(code: string, encryptedSecret: string) {
    const decrypted =
      await this.encryptingService.decryptWithPrivateKey(encryptedSecret);

    return authenticator.verify({ token: code, secret: decrypted });
  }

  async enableTFAForUser(email: string, secret: string) {
    const encrypted = await this.encryptingService.encryptWithPublicKey(secret);

    try {
      await this.userModel.updateOne(
        { email },
        { tfaSecret: encrypted, isTFAEnabled: true },
      );
    } catch {
      throw new NotFoundException('No user found');
    }
  }

  async disableTFAForUser(email: string) {
    try {
      await this.userModel.updateOne({ email }, { isTFAEnabled: false });
      return;
    } catch {
      throw new NotFoundException('No user found');
    }
  }
}
