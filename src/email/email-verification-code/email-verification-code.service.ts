import { PrismaService } from '@/prisma/prisma.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class EmailVerificationCodeService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createEmailVerificationCode(userId: string) {
    try {
      const code = uuidv4()

      const expiresAt = new Date()
      expiresAt.setMinutes(
        expiresAt.getMinutes() +
          this.configService.getOrThrow<number>('EMAIL_VERIFICATION_CODE_EXPIRATION_TIME'),
      )

      return await this.prismaService.emailVerificationCode.create({
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

  async deleteEmailVerificationCode(id: string) {
    return await this.prismaService.emailVerificationCode.delete({
      where: { id },
    })
  }

  async findEmailVerificationCode(code: string) {
    return this.prismaService.emailVerificationCode.findFirst({
      where: {
        code,
        expiresAt: {
          gt: new Date(),
        },
      },
    })
  }

  async findEmailVerificationCodeByUserId(userId: string) {
    return this.prismaService.emailVerificationCode.findFirst({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    })
  }
}
