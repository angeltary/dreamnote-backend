import { UserResponse } from '@/api/user/dto/user.dto'
import { AuthorizedUser, JwtAuth } from '@/common/decorators'
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserService } from './user.service'

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @JwtAuth()
  @Get('@me')
  @HttpCode(HttpStatus.OK)
  async me(@AuthorizedUser() user: UserResponse) {
    return user
  }
}
