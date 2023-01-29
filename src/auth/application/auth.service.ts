import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async getPasswordHash(password: string): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, passwordSalt);
  }
}
