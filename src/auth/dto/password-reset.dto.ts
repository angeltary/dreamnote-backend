import { IsNotEmpty, IsString, Length } from 'class-validator'

export class RequestPasswordResetRequest {
  @IsString()
  @IsNotEmpty()
  email: string
}

export class ResetPasswordRequest {
  @IsString()
  @IsNotEmpty()
  code: string

  @IsString()
  @IsNotEmpty()
  @Length(6, 128)
  password: string
}
