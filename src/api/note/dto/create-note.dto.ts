import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateNoteRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string

  @IsString()
  @IsNotEmpty()
  content: string
}
