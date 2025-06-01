import { IS_DEV } from '@/shared/lib/utils'
import { MailerOptions } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'

export const getMailerConfig = async (
  configService: ConfigService,
): Promise<MailerOptions> => ({
  transport: {
    host: configService.getOrThrow<string>('EMAIL_HOST'),
    port: configService.getOrThrow<number>('EMAIL_PORT'),
    secure: !IS_DEV,
    auth: {
      user: configService.getOrThrow<string>('EMAIL_LOGIN'),
      pass: configService.getOrThrow<string>('EMAIL_PASSWORD'),
    },
  },
  defaults: {
    from: `"Dreamnote Team" ${configService.getOrThrow<string>('EMAIL_LOGIN')}`,
  },
})
