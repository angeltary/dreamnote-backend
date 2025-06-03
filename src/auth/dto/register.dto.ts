import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'

export class RegisterRequest {
  @IsString()
  @IsNotEmpty()
  @Length(3, 32)
  name: string

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  @Length(6, 128)
  password: string
}
