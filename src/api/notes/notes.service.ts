import { PrismaService } from '@/infra/prisma/prisma.service'
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateNoteRequest, UpdateNoteRequest } from './dto'

@Injectable()
export class NotesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: string, createNoteDto: CreateNoteRequest) {
    const note = await this.prismaService.note.create({
      data: {
        title: createNoteDto.title,
        content: createNoteDto.content,
        userId,
      },
    })

    return {
      id: note.id,
      title: note.title,
      content: note.content,
    }
  }

  async findAll(userId: string) {
    const notes = await this.prismaService.note.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
      },
    })

    return notes
  }

  async findOne(id: string, userId: string) {
    const note = await this.prismaService.note.findUnique({
      where: { id },
    })

    if (!note) {
      throw new NotFoundException('Note not found')
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('No access to this note')
    }

    return {
      id: note.id,
      title: note.title,
      content: note.content,
    }
  }

  async update(id: string, userId: string, updateNoteDto: UpdateNoteRequest) {
    await this.findOne(id, userId)

    const updatedNote = await this.prismaService.note.update({
      where: { id },
      data: updateNoteDto,
    })

    return {
      id: updatedNote.id,
      title: updatedNote.title,
      content: updatedNote.content,
    }
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId)

    await this.prismaService.note.delete({
      where: { id },
    })

    return true
  }
}
