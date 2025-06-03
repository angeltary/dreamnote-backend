import { AuthorizedUser, JwtAuth } from '@/common/decorators'
import { UserResponse } from '@/user/dto/user.dto'
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common'
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { LoginRequest } from './dto/login.dto'
import { RegisterRequest } from './dto/register.dto'
import { ResetPasswordRequest } from './dto/reset-password.dto'
import { VerifyUserRequest } from './dto/verify-user.dto'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterRequest) {
    return await this.authService.register(dto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Res({ passthrough: true }) res: Response, @Body() dto: LoginRequest) {
    return await this.authService.login(res, dto)
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() dto: VerifyUserRequest) {
    return await this.authService.verifyEmail(dto)
  }

  @ApiBearerAuth()
  @JwtAuth()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordRequest) {
    return await this.authService.resetPassword(dto)
  }

  @ApiCookieAuth()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.authService.refresh(req, res)
  }

  @ApiCookieAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    return await this.authService.logout(res)
  }

  @ApiBearerAuth()
  @JwtAuth()
  @Get('account')
  @HttpCode(HttpStatus.OK)
  async me(@AuthorizedUser() user: UserResponse) {
    return user
  }
}
