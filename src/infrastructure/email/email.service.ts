import { ConfirmationTemplate } from '@/email/templates/confirmation.template'
import { PrismaService } from '@/prisma/prisma.service'
import { UserService } from '@/user/user.service'
import { MailerService } from '@nestjs-modules/mailer'
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components'

@Injectable()
export class EmailService {
  public constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async sendVerificationCode(email: string, code: string) {
    const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
    const html = await render(ConfirmationTemplate({ domain, code }))

    return this.sendMail(email, 'Подтверждение почты', html)
  }

  async createVerificationCode(userId: string) {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
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

  async verifyCode(code: string) {
    const verificationCode = await this.prismaService.verificationCode.findFirst({
      where: {
        code,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (verificationCode) {
      const user = await this.userService.findOne(verificationCode.userId)

      if (user.isVerified) {
        throw new UnauthorizedException('User already verified')
      }

      await this.userService.update(user.id, { isVerified: true })
      await this.deleteVerificationCode(verificationCode.id)

      return true
    }

    return false
  }

  private async sendMail(email: string, subject: string, html: string) {
    return this.mailerService.sendMail({
      to: email,
      subject,
      html,
    })
  }
}
