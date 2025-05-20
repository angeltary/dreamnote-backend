import { IsNotEmpty, IsString } from 'class-validator'

export class RequestPasswordResetRequest {
  @IsString()
  @IsNotEmpty()
  email: string
}
