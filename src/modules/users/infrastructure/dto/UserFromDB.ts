export class UserFromDB {
  id: string;
  login: string;
  passwordHash: string;
  email: string;
  createdAt: Date;
  isConfirmed: boolean;
  confirmationCode: string;
  codeExpirationDate: Date;
  isBanned: boolean;
  banReason: string;
  banDate: Date;
}
