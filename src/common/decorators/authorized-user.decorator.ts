import { UserResponse } from '@/api/users/dto'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const AuthorizedUser = createParamDecorator(
  (data: keyof UserResponse, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user as UserResponse

    return data ? user[data] : user
  },
)
