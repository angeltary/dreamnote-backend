import { RegisterRequest } from '@/auth/dto/register.dto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany()
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return user
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    })
  }

  async create(data: RegisterRequest) {
    return this.prisma.user.create({ data })
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    })
  }

  async update(id: string, data: Partial<User>) {
    return this.prisma.user.update({
      where: { id },
      data,
    })
  }
}
