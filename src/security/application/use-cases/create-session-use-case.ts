import { ApiJwtService } from '../../../auth/application/api-jwt.service';
import { Injectable } from '@nestjs/common';
import { SecurityRepository } from '../../infrastructure/security.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from '../../domain/session.schema';
import { Model } from 'mongoose';
import { TokensType } from '../../../auth/application/types/types';

@Injectable()
export class CreateSessionUseCase {
  constructor(
    protected apiJwtService: ApiJwtService,
    protected securityRepository: SecurityRepository,
    @InjectModel(Session.name) private SessionModel: Model<SessionDocument>,
  ) {}

  async execute(userId: string, ip: string, title: string): Promise<TokensType> {
    const tokens = await this.apiJwtService.createJWT(userId, null);
    const refreshTokenData = await this.apiJwtService.getSessionDataByRefreshToken(tokens.refreshToken);

    const session = new this.SessionModel({ ...refreshTokenData, ip, title });
    await this.securityRepository.saveSession(session);

    return tokens;
  }
}
