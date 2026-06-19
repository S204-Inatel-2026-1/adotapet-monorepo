import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

const toUpper = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

const toBoolean = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return value;
};

export class CreateUserDto {
  @ApiProperty({ example: 'Lucas Andrade' })
  @Transform(trimString)
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ example: 'lucas@adotapet.com' })
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(150)
  email: string;

  @ApiProperty({
    example: 'Str0ng@Pass123',
    minLength: 8,
    description:
      'At least 8 characters, including uppercase, lowercase, number and special character.',
  })
  @Transform(trimString)
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, {
    message: 'password must contain uppercase, lowercase, number and special character',
  })
  password: string;

  @ApiPropertyOptional({ example: '+55 11 99999-8888' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: 'Santa Rita do Sapucaí' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  city?: string;

  @ApiPropertyOptional({ example: 'MG' })
  @IsOptional()
  @Transform(toUpper)
  @IsString()
  @MaxLength(2)
  state?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.ADOPTER })
  @IsOptional()
  @Transform(toUpper)
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isActive?: boolean;
}
