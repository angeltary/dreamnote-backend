import { UsersService } from '@/api/user/users.service'
import { JwtPayload } from '@/common/interfaces/jwt.interface'
import { IS_DEV } from '@/common/utils/is-dev'
import { MailService } from '@/libs/mail/mail.service'
import { VerificationService } from '@/libs/verification/verification.service'
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
import { NotesService } from '../note/notes.service'
import { LoginRequest, RegisterRequest, ResetPasswordRequest, VerifyUserRequest } from './dto'

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_EXPIRATION_TIME: number
  private readonly JWT_REFRESH_TOKEN_EXPIRATION_TIME: number

  private readonly COOKIE_DOMAIN: string

  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly verificationService: VerificationService,
    private readonly notesService: NotesService,
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

    const existingUser = await this.userService.findByMail(email)

    if (existingUser) {
      throw new ConflictException('User with this email already exists')
    }

    const createdUser = await this.userService.create({
      name,
      email,
      password: await hash(password),
    })

    const createdCode = await this.verificationService.createVerificationCode(createdUser.id)
    try {
      await this.mailService.sendEmailVerification(createdUser.email, createdCode.code)
    } catch {
      await this.verificationService.deleteVerificationCode(createdCode.id)
      await this.userService.delete(createdUser.id)

      throw new BadRequestException('Failed to send verification code')
    }

    return {
      message: 'Check your email to continue registration process',
    }
  }

  async login(res: Response, dto: LoginRequest) {
    const { email, password } = dto

    const user = await this.userService.findByMail(email)

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

  async verifyMail(dto: VerifyUserRequest) {
    const verificationCode = await this.verificationService.findVerificationCode(dto.code)

    if (!verificationCode) {
      throw new BadRequestException('Invalid verification code')
    }

    const user = await this.userService.findOne(verificationCode.userId)

    if (user.isVerified) {
      throw new ConflictException('User already verified')
    }

    await this.userService.update(user.id, { isVerified: true })
    await this.verificationService.deleteVerificationCode(verificationCode.id)

    await this.notesService.create(user.id, {
      title: 'Dreamnote 101',
      content: 'Привет, это твоя первая заметка!',
    })

    return true
  }

  async resetPassword(dto: ResetPasswordRequest) {
    const user = await this.userService.findByMail(dto.email)

    if (!user) {
      throw new BadRequestException('User not found')
    }

    await this.userService.update(user.id, { password: await hash(dto.password) })

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
