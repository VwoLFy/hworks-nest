import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  findUsers(term) {
    return [
      { id: 1, name: 'Wolfy' },
      { id: 2, name: 'Vitalii' },
    ].filter((u) => !term || u.name.indexOf(term) > -1);
  }
}
