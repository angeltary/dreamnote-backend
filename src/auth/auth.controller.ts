import { AuthorizedUser, JwtAuth } from '@/common/decorators'
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { LoginRequest, LoginResponse } from './dto/login.dto'
import { RegisterRequest, RegisterResponse } from './dto/register.dto'
import { UserResponse } from './dto/user.dto'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register User', description: 'Register a new user' })
  @ApiCreatedResponse({
    type: RegisterResponse,
  })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Res({ passthrough: true }) res: Response, @Body() dto: RegisterRequest) {
    return await this.authService.register(res, dto)
  }

  @ApiOperation({ summary: 'User Login', description: 'Login a user' })
  @ApiOkResponse({
    type: LoginResponse,
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Res({ passthrough: true }) res: Response, @Body() dto: LoginRequest) {
    return await this.authService.login(res, dto)
  }

  @ApiOperation({ summary: 'Refresh Access Token', description: 'Refresh access token' })
  @ApiOkResponse({
    type: LoginResponse,
  })
  @ApiCookieAuth()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.authService.refresh(req, res)
  }

  @ApiOperation({ summary: 'User Logout', description: 'Logout a user' })
  @ApiOkResponse({
    type: Boolean,
  })
  @ApiCookieAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    return await this.authService.logout(res)
  }

  @ApiOperation({ summary: 'Get Current User', description: 'Get current user information' })
  @ApiOkResponse({
    type: UserResponse,
  })
  @ApiBearerAuth()
  @JwtAuth()
  @Get('account')
  @HttpCode(HttpStatus.OK)
  async me(@AuthorizedUser() user: UserResponse) {
    return user
  }
}
