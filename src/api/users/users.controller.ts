import { AuthorizedUser, JwtAuth } from '@/common/decorators'
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserResponse } from './dto'
import { UsersService } from './users.service'

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@JwtAuth()
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('@me')
  @HttpCode(HttpStatus.OK)
  async me(@AuthorizedUser() user: UserResponse) {
    return user
  }
}
