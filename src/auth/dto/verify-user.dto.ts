import { IsNotEmpty, IsString } from 'class-validator'

export class VerifyUserRequest {
  @IsString()
  @IsNotEmpty()
  code: string
}
