import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDTO {
  @ApiProperty({ example: 'john' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: '1234$$@89' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ example: 'john@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
