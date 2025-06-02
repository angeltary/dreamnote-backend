import { EmailConfirmationTemplate } from '@/email/templates/email-confirmation.template'
import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components'
import { ResetPasswordTemplate } from './templates/reset-password.template'

@Injectable()
export class EmailService {
  public constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmailConfirmationRequest(email: string, code: string) {
    const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
    const html = await render(EmailConfirmationTemplate({ domain, code }))

    return this.sendMail(email, 'Подтверждение почты', html)
  }

  async sendPasswordResetRequest(email: string, code: string) {
    const html = await render(ResetPasswordTemplate({ code }))

    return this.sendMail(email, 'Сброс пароля', html)
  }

  private async sendMail(email: string, subject: string, html: string) {
    return this.mailerService.sendMail({
      to: email,
      subject,
      html,
    })
  }
}
