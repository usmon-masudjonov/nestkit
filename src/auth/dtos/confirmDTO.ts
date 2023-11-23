import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ConfirmDTO {
  @ApiProperty({ example: 'john@gmail.com' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ example: '550172' })
  @Type(() => Number)
  @IsNumber()
  otp: number;
}
