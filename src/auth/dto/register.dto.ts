import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'

export class RegisterRequest {
  @ApiProperty({
    description: 'User displayname',
    example: 'angeltary',
    minLength: 3,
    maxLength: 16,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 16)
  name: string

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 128)
  password: string
}

export class RegisterResponse {
  @ApiProperty({
    description: 'JWT access token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5YjA0ZGRhZi00YzdlLTQwN2MtOGRkZC1kYjZiODFhZjllZGIiLCJleHAiOjE3NDc1MDI0Njh9.xOx_hw0XhP2cp5rTjMt7t-ipIpMGBhNAFKO-gH6K5DA',
  })
  accessToken: string
}
