import { Module } from '@nestjs/common'
import { EmailVerificationCodeService } from './email-verification-code.service'

@Module({
  providers: [EmailVerificationCodeService],
  exports: [EmailVerificationCodeService],
})
export class EmailVerificationCodeModule {}
