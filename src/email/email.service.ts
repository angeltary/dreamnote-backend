import { EmailConfirmationTemplate } from '@/email/templates/email-confirmation.template'
import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components'

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

  private async sendMail(email: string, subject: string, html: string) {
    return this.mailerService.sendMail({
      to: email,
      subject,
      html,
    })
  }
}
