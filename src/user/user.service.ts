import { RegisterRequest } from '@/auth/dto/register.dto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.user.findMany()
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
    })
  }

  async create(data: RegisterRequest) {
    return this.prismaService.user.create({ data })
  }

  async delete(id: string) {
    return this.prismaService.user.delete({
      where: { id },
    })
  }

  async update(id: string, data: Partial<User>) {
    return this.prismaService.user.update({
      where: { id },
      data,
    })
  }
}
