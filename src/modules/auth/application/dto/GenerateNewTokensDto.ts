import { SessionDto } from '../../../security/application/dto/SessionDto';

export class GenerateNewTokensDto {
  oldSessionData: SessionDto;
  ip: string;
  title: string;
}
