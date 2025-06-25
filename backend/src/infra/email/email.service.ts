import nodemailer, { Transporter } from 'nodemailer';
import { mailtrapConfig } from '@config/email.config';
import { TemplateService } from './template.service';
import { TemplateNames, TemplateWithPayloadArgs } from './types';

export class EmailService {
  #transporter: Transporter;
  #templateService: TemplateService<TemplateNames>;

  constructor() {
    this.#transporter = nodemailer.createTransport({
      host: mailtrapConfig.domain,
      port: 2525,
      auth: {
        user: mailtrapConfig.apiKey,
        pass: mailtrapConfig.pass,
      },
    });

    this.#templateService = new TemplateService(mailtrapConfig.templateDir);
  }

  async sendEmail<T extends TemplateNames>(emailOpts: {
    to: string;
    subject: string;
    templateName: T;
    templateArgs: TemplateWithPayloadArgs<T>;
  }): Promise<void> {
    const { to, subject, templateName, templateArgs } = emailOpts;
    const htmlContent = this.#templateService.renderTemplate(
      templateName,
      templateArgs
    );

    await this.#transporter.sendMail({
      from: '"Expense Tracker" <no-reply@expensetracker.com>',
      to,
      subject,
      html: htmlContent,
    });
  }
}

export const emailService = new EmailService();
