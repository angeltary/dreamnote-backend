import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { NotesModule } from './notes/notes.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [AuthModule, UsersModule, NotesModule],
})
export class ApiModule {}
