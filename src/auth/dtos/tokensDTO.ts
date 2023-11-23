import { ApiProperty } from '@nestjs/swagger';

export class TokensDTO {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
