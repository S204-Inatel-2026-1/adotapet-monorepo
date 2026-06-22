import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class ResetPasswordDto {
  @ApiProperty({ description: 'Single-use token received by e-mail' })
  @Transform(trimString)
  @IsString()
  @MinLength(32)
  @MaxLength(128)
  token: string;

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
}
