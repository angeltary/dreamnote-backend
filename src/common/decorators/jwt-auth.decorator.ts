import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { applyDecorators, UseGuards } from '@nestjs/common'

export function JwtAuth() {
  return applyDecorators(UseGuards(JwtAuthGuard))
}
