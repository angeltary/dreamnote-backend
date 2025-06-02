import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PasswordResetToken } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class PasswordResetTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createPasswordResetToken(email: string) {
    try {
      const token = uuidv4()
      const code = Math.floor(100000 + Math.random() * 900000).toString()

      const expiresAt = new Date()
      expiresAt.setMinutes(
        expiresAt.getMinutes() +
          this.configService.getOrThrow<number>('PASSWORD_RESET_TOKEN_EXPIRATION_TIME'),
      )

      return await this.prisma.passwordResetToken.create({
        data: {
          email,
          token,
          code,
          expiresAt,
        },
      })
    } catch {
      throw new BadRequestException('Failed to create password reset token')
    }
  }

  async deletePasswordResetToken(email: string) {
    return await this.prisma.passwordResetToken.delete({
      where: { email },
    })
  }

  async findPasswordResetToken(token: string) {
    return this.prisma.passwordResetToken.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
    })
  }

  async findPasswordResetTokenByEmail(email: string) {
    return this.prisma.passwordResetToken.findFirst({
      where: {
        email,
        expiresAt: {
          gt: new Date(),
        },
      },
    })
  }

  async findPasswordResetTokenByCode(code: string) {
    return this.prisma.passwordResetToken.findFirst({
      where: {
        code,
        expiresAt: {
          gt: new Date(),
        },
      },
    })
  }

  async updatePasswordResetToken(id: string, data: Partial<PasswordResetToken>) {
    return this.prisma.passwordResetToken.update({
      where: { id },
      data,
    })
  }
}
