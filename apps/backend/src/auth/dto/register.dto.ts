import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, RegisterDto as IRegisterDto } from '@campus-food/shared-types';

export class RegisterDto implements IRegisterDto {
  @ApiProperty({ example: 'somchai@university.ac.th' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Somchai Jaidee' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ enum: Role, default: Role.STUDENT })
  @IsEnum(Role, { message: 'Role must be student, vendor, or admin' })
  @IsNotEmpty()
  role: Role;

  @ApiPropertyOptional({ example: '0812345678' })
  @IsOptional()
  @IsString()
  phone?: string;
}
