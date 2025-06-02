import { EmailVerificationCodeService } from '@/email/email-verification-code/email-verification-code.service'
import { EmailService } from '@/email/email.service'
import { PasswordResetTokenService } from '@/email/password-reset-token/password-reset-token.service'
import { IS_DEV } from '@/shared/lib/utils/is-dev'
import { UserService } from '@/user/user.service'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { hash, verify } from 'argon2'
import { Request, Response } from 'express'
import { LoginRequest } from './dto/login.dto'
import { RegisterRequest } from './dto/register.dto'
import {
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  VerifyPasswordResetRequest,
} from './dto/reset-password.dto'
import { VerifyUserRequest } from './dto/verify-user.dto'
import { JwtPayload } from './interfaces/jwt.interface'

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_EXPIRATION_TIME: number
  private readonly JWT_REFRESH_TOKEN_EXPIRATION_TIME: number

  private readonly COOKIE_DOMAIN: string

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly emailVerificationCodeService: EmailVerificationCodeService,
    private readonly passwordResetTokenService: PasswordResetTokenService,
  ) {
    this.JWT_ACCESS_TOKEN_EXPIRATION_TIME = configService.getOrThrow<number>(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    )
    this.JWT_REFRESH_TOKEN_EXPIRATION_TIME = configService.getOrThrow<number>(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    )

    this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN')
  }

  async register(dto: RegisterRequest) {
    const { name, email, password } = dto

    const existingUser = await this.userService.findByEmail(email)

    if (existingUser) {
      throw new ConflictException('User with this email already exists')
    }

    const createdUser = await this.userService.create({
      name,
      email,
      password: await hash(password),
    })

    const createdCode = await this.emailVerificationCodeService.createEmailVerificationCode(
      createdUser.id,
    )
    try {
      await this.emailService.sendEmailConfirmationRequest(
        createdUser.email,
        createdCode.code,
      )
    } catch {
      await this.emailVerificationCodeService.deleteEmailVerificationCode(createdCode.id)
      await this.userService.delete(createdUser.id)

      throw new BadRequestException('Failed to send verification code')
    }

    return {
      message: 'Check your email to continue registration process',
    }
  }

  async login(res: Response, dto: LoginRequest) {
    const { email, password } = dto

    const user = await this.userService.findByEmail(email)

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('User is not verified')
    }

    const isPasswordValid = await verify(user.password, password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return this.auth(res, user.id)
  }

  async verifyCode(dto: VerifyUserRequest) {
    const EmailVerificationCode =
      await this.emailVerificationCodeService.findEmailVerificationCode(dto.code)

    if (!EmailVerificationCode) {
      throw new BadRequestException('Invalid verification code')
    }

    const user = await this.userService.findOne(EmailVerificationCode.userId)

    if (user.isVerified) {
      throw new ConflictException('User already verified')
    }

    await this.userService.update(user.id, { isVerified: true })
    await this.emailVerificationCodeService.deleteEmailVerificationCode(
      EmailVerificationCode.id,
    )

    return true
  }

  async requestPasswordReset(dto: RequestPasswordResetRequest) {
    const user = await this.userService.findByEmail(dto.email)

    if (!user) {
      throw new BadRequestException('User not found')
    }

    const existingToken = await this.passwordResetTokenService.findPasswordResetTokenByEmail(
      user.email,
    )
    if (existingToken) {
      throw new BadRequestException('Password reset token already exists')
    }

    const createdToken = await this.passwordResetTokenService.createPasswordResetToken(
      user.email,
    )
    try {
      await this.emailService.sendPasswordResetRequest(user.email, createdToken.code)
    } catch {
      await this.passwordResetTokenService.deletePasswordResetToken(createdToken.email)

      throw new BadRequestException('Failed to send password reset token')
    }

    return {
      message: 'Check your email to continue password change process',
    }
  }

  async verifyPasswordResetToken(dto: VerifyPasswordResetRequest) {
    const passwordResetToken =
      await this.passwordResetTokenService.findPasswordResetTokenByCode(dto.code)

    if (
      !passwordResetToken ||
      passwordResetToken.isCodeVerified ||
      passwordResetToken.isUsed
    ) {
      throw new BadRequestException('Invalid password reset token')
    }

    await this.passwordResetTokenService.updatePasswordResetToken(passwordResetToken.id, {
      isCodeVerified: true,
    })

    return { token: passwordResetToken.token }
  }

  async resetPassword(dto: ResetPasswordRequest) {
    const passwordResetToken = await this.passwordResetTokenService.findPasswordResetToken(
      dto.token,
    )

    if (
      !passwordResetToken ||
      !passwordResetToken.isCodeVerified ||
      passwordResetToken.isUsed
    ) {
      throw new BadRequestException('Invalid password reset token')
    }

    const user = await this.userService.findByEmail(passwordResetToken.email)

    if (!user) {
      throw new BadRequestException('User not found')
    }

    await this.userService.update(user.id, { password: await hash(dto.password) })

    await this.passwordResetTokenService.updatePasswordResetToken(passwordResetToken.id, {
      isUsed: true,
    })

    return true
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken)

    if (payload.id) {
      try {
        const user = await this.userService.findOne(payload.id)
        return this.auth(res, user.id)
      } catch {
        throw new UnauthorizedException('User not found')
      }
    }
  }

  async logout(res: Response) {
    this.setCookie(res, 'refreshToken', new Date(0))

    return true
  }

  async validate(id: string) {
    try {
      const user = await this.userService.findOne(id)
      return {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    } catch {
      throw new UnauthorizedException('User not found')
    }
  }

  private auth(res: Response, id: string) {
    const { accessToken, refreshToken } = this.generateTokens(id)

    this.setCookie(
      res,
      refreshToken,
      new Date(Date.now() + this.JWT_REFRESH_TOKEN_EXPIRATION_TIME * 1000),
    )

    return { accessToken }
  }

  private generateTokens(id: string) {
    const payload: JwtPayload = { id }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: `${this.JWT_ACCESS_TOKEN_EXPIRATION_TIME}s`,
    })

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: `${this.JWT_REFRESH_TOKEN_EXPIRATION_TIME}s`,
    })

    return { accessToken, refreshToken }
  }

  private setCookie(res: Response, value: string, expires: Date) {
    res.cookie('refreshToken', value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      expires,
      secure: !IS_DEV,
      sameSite: !IS_DEV ? 'lax' : 'none',
    })
  }
}
