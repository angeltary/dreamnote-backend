import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import { ConfigService } from '@nestjs/config'

export function getCorsConfig(config: ConfigService): CorsOptions {
  return {
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  }
}
