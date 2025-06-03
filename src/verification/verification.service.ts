import { PrismaService } from '@/prisma/prisma.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class VerificationService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createVerificationCode(userId: string) {
    try {
      const code = uuidv4()

      const expiresAt = new Date()
      expiresAt.setMinutes(
        expiresAt.getMinutes() +
          this.configService.getOrThrow<number>('VERIFICATION_CODE_EXPIRATION_TIME'),
      )

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

  async findVerificationCodeByUserId(userId: string) {
    return this.prismaService.verificationCode.findFirst({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    })
  }
}
