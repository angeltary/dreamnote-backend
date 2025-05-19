import { ApiProperty } from '@nestjs/swagger'

export class UserResponse {
  @ApiProperty({
    description: 'Unique user identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string

  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  email: string

  @ApiProperty({ description: 'User display name', example: 'angeltary' })
  name: string
}
