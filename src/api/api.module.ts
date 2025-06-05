import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { NotesModule } from './note/notes.module'
import { UsersModule } from './user/users.module'

@Module({
  imports: [AuthModule, UsersModule, NotesModule],
})
export class ApiModule {}
