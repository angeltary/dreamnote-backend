import { Module } from '@nestjs/common'
import { MailModule } from './mail/mail.module'
import { VerificationModule } from './verification/verification.module'

@Module({
  imports: [MailModule, VerificationModule],
})
export class LibsModule {}
