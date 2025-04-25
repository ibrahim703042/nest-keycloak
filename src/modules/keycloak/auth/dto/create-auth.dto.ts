import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'admin@waangu.com',
    required: true,
  })
  @IsNotEmpty({ message: 'Email address is required.' })
  username: string;

  @ApiProperty({
    description: 'Password of the user (must be 8-16 characters long)',
    example: '123456',
    required: true,
  })
  @Length(6, 6, {
    message: 'Password must be exactly 6 characters long.',
  })
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;
}

export class LogoutDto {
  @ApiProperty({
    description: 'ID of the user logging out',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString({ message: 'User ID must be a string.' })
  @IsNotEmpty({ message: 'User ID is required.' })
  userId: string;
}
