import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import * as ejs from 'ejs';
import * as nodemailer from 'nodemailer';
import { join } from 'path';
import { EventPayloads } from 'src/common/interfaces/event-emitter/event-payloads.interface';
import { AllConfigType } from 'src/config/config.type';

@Injectable()
export class EMailerService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    this.transporter = nodemailer.createTransport({
      service: this.configService.getOrThrow('emailer.service', {
        infer: true,
      }),
      secure: false,
      auth: {
        user: this.configService.getOrThrow('emailer.user', { infer: true }),
        pass: this.configService.getOrThrow('emailer.passkey', { infer: true }),
      },
    });
  }

  @OnEvent('user.welcome')
  async welcomeEmail(data: EventPayloads['user.welcome']) {
    const { email } = data;

    const subject = `Welcome: ${email}`;

    // Render the template
    const templatePath = join(__dirname, 'templates', 'welcome.ejs');
    const html = await ejs.renderFile(templatePath, { email });

    const from = `"${this.configService.getOrThrow('emailer.username', {
      infer: true,
    })}" <${this.configService.getOrThrow('emailer.user', { infer: true })}>`;

    await this.transporter.sendMail({
      from,
      to: email,
      subject,
      html,
    });
  }
}
