import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDTO {
  @ApiProperty({ example: 'john' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(6)
  password: string;
}
