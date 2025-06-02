import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { EmailVerificationCodeModule } from './email/email-verification-code/email-verification-code.module'
import { EmailModule } from './email/email.module'
import { PrismaModule } from './prisma/prisma.module'
import { UserModule } from './user/user.module'
import { PasswordResetTokenModule } from './email/password-reset-token/password-reset-token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    EmailModule,
    UserModule,
    EmailVerificationCodeModule,
    PasswordResetTokenModule,
  ],
})
export class AppModule {}
