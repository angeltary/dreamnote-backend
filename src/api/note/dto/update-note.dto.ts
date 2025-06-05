import { PartialType } from '@nestjs/swagger'
import { CreateNoteRequest } from './create-note.dto'

export class UpdateNoteRequest extends PartialType(CreateNoteRequest) {}
