import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class NoteResponse {
  @IsString()
  @IsNotEmpty()
  id: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string

  @IsString()
  @IsNotEmpty()
  content: string
}
