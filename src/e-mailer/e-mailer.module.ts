import { Module } from '@nestjs/common';
import { EMailerService } from './e-mailer.service';

@Module({
  providers: [EMailerService],
  exports: [EMailerService],
})
export class EMailerModule {}
