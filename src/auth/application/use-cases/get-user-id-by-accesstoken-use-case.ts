import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenDataType } from '../types/types';

@Injectable()
export class GetUserIdByAccessTokenUseCase {
  constructor(private jwtService: JwtService) {}

  async execute(accessToken: string): Promise<string | null> {
    try {
      const result = this.jwtService.verify(accessToken) as AccessTokenDataType;
      return result.userId;
    } catch (e) {
      return null;
    }
  }
}
