import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LoginDto as ILoginDto } from '@campus-food/shared-types';

export class LoginDto implements ILoginDto {
  @ApiProperty({ example: 'vendor1@university.ac.th' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}
