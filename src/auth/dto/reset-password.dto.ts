import { IsNotEmpty, IsString, Length } from 'class-validator'

export class ResetPasswordRequest {
  @IsString()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  @Length(6, 128)
  password: string
}
