import { Transform } from 'class-transformer';
import { IsBoolean, IsString, Length, ValidateIf } from 'class-validator';

export class BanUserDto {
  @IsBoolean()
  isBanned: boolean;

  @ValidateIf((object) => object.isBanned === true)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(20)
  @IsString()
  banReason: string;
}
