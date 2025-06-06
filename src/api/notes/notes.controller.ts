import { AuthorizedUser, JwtAuth } from '@/common/decorators'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserResponse } from '../users/dto'
import { CreateNoteRequest, UpdateNoteRequest } from './dto'
import { NotesService } from './notes.service'

@ApiTags('Notes')
@Controller('notes')
@ApiBearerAuth()
@JwtAuth()
export class NotesController {
  constructor(private readonly noteService: NotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @AuthorizedUser() user: UserResponse,
    @Body() createNoteDto: CreateNoteRequest,
  ) {
    return this.noteService.create(user.id, createNoteDto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@AuthorizedUser() user: UserResponse) {
    return this.noteService.findAll(user.id)
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@AuthorizedUser() user: UserResponse, @Param('id') id: string) {
    return this.noteService.findOne(id, user.id)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @AuthorizedUser() user: UserResponse,
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteRequest,
  ) {
    return this.noteService.update(id, user.id, updateNoteDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@AuthorizedUser() user: UserResponse, @Param('id') id: string) {
    return this.noteService.remove(id, user.id)
  }
}
