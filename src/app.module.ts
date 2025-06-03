import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { EmailModule } from './email/email.module'
import { PrismaModule } from './prisma/prisma.module'
import { UserModule } from './user/user.module'
import { VerificationModule } from './verification/verification.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    EmailModule,
    UserModule,
    VerificationModule,
  ],
})
export class AppModule {}
