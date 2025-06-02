import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'

export class RequestPasswordResetRequest {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string
}

export class ResetPasswordRequest {
  @IsString()
  @IsNotEmpty()
  token: string

  @IsString()
  @IsNotEmpty()
  @Length(6, 128)
  password: string
}

export class VerifyPasswordResetRequest {
  @IsString()
  @IsNotEmpty()
  code: string
}

export class VerifyPasswordResetResponse {
  @IsString()
  @IsNotEmpty()
  token: string
}
