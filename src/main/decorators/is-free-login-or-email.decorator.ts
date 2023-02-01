import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../modules/users/infrastructure/users.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsFreeLoginOrEmailConstraint implements ValidatorConstraintInterface {
  constructor(protected usersRepository: UsersRepository) {}

  async validate(value: string) {
    const loginExist = await this.usersRepository.findUserByLoginOrEmail(value);
    return !loginExist;
  }

  defaultMessage() {
    return `login or email are already exists`;
  }
}

export function IsFreeLoginOrEmail(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFreeLoginOrEmailConstraint,
    });
  };
}
