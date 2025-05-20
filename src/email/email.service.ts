import { ConfirmationTemplate } from '@/email/templates/confirmation.template'
import { PrismaService } from '@/prisma/prisma.service'
import { MailerService } from '@nestjs-modules/mailer'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components'
import { v4 as uuidv4 } from 'uuid'
import { ResetPasswordTemplate } from './templates/reset-password.template'

@Injectable()
export class EmailService {
  public constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async sendVerifyRequest(email: string, code: string) {
    const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
    const html = await render(ConfirmationTemplate({ domain, code }))

    return this.sendMail(email, 'Подтверждение почты', html)
  }

  async sendPasswordResetRequest(email: string, code: string) {
    const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
    const html = await render(ResetPasswordTemplate({ domain, code }))

    return this.sendMail(email, 'Сброс пароля', html)
  }

  async createVerificationCode(userId: string) {
    try {
      const code = uuidv4()

      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 15)

      return await this.prismaService.verificationCode.create({
        data: {
          code,
          expiresAt,
          userId,
        },
      })
    } catch {
      throw new BadRequestException('Failed to create verification code')
    }
  }

  async deleteVerificationCode(id: string) {
    return await this.prismaService.verificationCode.delete({
      where: { id },
    })
  }

  async findVerificationCode(code: string) {
    return this.prismaService.verificationCode.findFirst({
      where: {
        code,
        expiresAt: {
          gt: new Date(),
        },
      },
    })
  }

  private async sendMail(email: string, subject: string, html: string) {
    return this.mailerService.sendMail({
      to: email,
      subject,
      html,
    })
  }
}
