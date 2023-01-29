import { Request } from 'express';
import { SessionDto } from '../../security/application/dto/SessionDto';

declare global {
  declare namespace Express {
    export interface Request {
      userId: string;
      sessionData: SessionDto;
    }
  }
}
