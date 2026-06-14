import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
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

const normalizeCnpj = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.replace(/\D/g, '') : value;

export class RegisterOrganizationDto {
  @ApiProperty({ example: 'Maria Oliveira' })
  @Transform(trimString)
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ example: 'maria@ong.org.br' })
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

  @ApiPropertyOptional({ example: '+55 35 99999-8888' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiProperty({ example: 'Instituto AdotaPet' })
  @Transform(trimString)
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  legalName: string;

  @ApiPropertyOptional({ example: 'AdotaPet ONG' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(150)
  tradeName?: string;

  @ApiPropertyOptional({ example: '12.345.678/0001-90' })
  @IsOptional()
  @Transform(normalizeCnpj)
  @IsString()
  @Matches(/^\d{14}$/, { message: 'cnpj must contain 14 digits' })
  cnpj?: string;

  @ApiPropertyOptional({ example: 'ONG focada em adocao responsavel.' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'Santa Rita do Sapucai' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'MG' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(2)
  state?: string;
}
