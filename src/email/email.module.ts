import { getMailerConfig } from '@/config/mailer.config'
import { UserModule } from '@/user/user.module'
import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EmailService } from './email.service'

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getMailerConfig,
      inject: [ConfigService],
    }),
    UserModule,
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
