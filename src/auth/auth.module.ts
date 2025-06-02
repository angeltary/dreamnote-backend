import { getJwtConfig } from '@/config/jwt.config'
import { EmailVerificationCodeModule } from '@/email/email-verification-code/email-verification-code.module'
import { EmailModule } from '@/email/email.module'
import { PasswordResetTokenModule } from '@/email/password-reset-token/password-reset-token.module'
import { UserModule } from '@/user/user.module'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
    UserModule,
    EmailModule,
    EmailVerificationCodeModule,
    PasswordResetTokenModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
