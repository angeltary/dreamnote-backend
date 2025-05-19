import { IS_DEV } from '@/common/lib/is-dev'
import { PrismaService } from '@/infra/prisma/prisma.service'
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { hash, verify } from 'argon2'
import { Request, Response } from 'express'
import { LoginRequest } from './dto/login.dto'
import { RegisterRequest } from './dto/register.dto'
import { JwtPayload } from './interfaces/jwt.interface'

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_EXPIRATION_TIME: number
  private readonly JWT_REFRESH_TOKEN_EXPIRATION_TIME: number

  private readonly COOKIE_DOMAIN: string

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_ACCESS_TOKEN_EXPIRATION_TIME = configService.getOrThrow<number>(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    )
    this.JWT_REFRESH_TOKEN_EXPIRATION_TIME = configService.getOrThrow<number>(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    )

    this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN')
  }

  async register(res: Response, dto: RegisterRequest) {
    const { name, email, password } = dto

    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      throw new ConflictException('User with this email already exists')
    }

    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password: await hash(password),
      },
    })

    return this.auth(res, user.id)
  }

  async login(res: Response, dto: LoginRequest) {
    const { email, password } = dto

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await verify(user.password, password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return this.auth(res, user.id)
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken)

    if (payload.id) {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: payload.id,
        },
        select: {
          id: true,
        },
      })

      if (!user) {
        throw new NotFoundException('User not found')
      }

      return this.auth(res, user.id)
    }
  }

  async logout(res: Response) {
    this.setCookie(res, 'refreshToken', new Date(0))

    return true
  }

  async validate(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    return user
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
