import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { setupSwagger } from './common/utils/setup-swagger'
import { getCorsConfig } from './config/cors.config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)

  app.use(cookieParser())

  app.useGlobalInterceptors(new LoggingInterceptor())

  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  app.enableCors(getCorsConfig(configService))

  setupSwagger(app)

  await app.listen(configService.getOrThrow<number>('APPLICATION_PORT') ?? 4000)
}
bootstrap()
