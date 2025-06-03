import { IsNotEmpty, IsString } from 'class-validator'

export class UserResponse {
  @IsString()
  @IsNotEmpty()
  id: string

  @IsString()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  name: string
}
