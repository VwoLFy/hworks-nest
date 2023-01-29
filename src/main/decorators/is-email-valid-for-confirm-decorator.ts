import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsEmailValidForConfirmConstraint implements ValidatorConstraintInterface {
  constructor(protected usersRepository: UsersRepository) {}

  async validate(value: string) {
    const foundUser = await this.usersRepository.findUserByLoginOrEmail(value);
    if (!foundUser || foundUser.emailConfirmation.isConfirmed) return false;
    return true;
  }

  defaultMessage() {
    return 'Email isn`t valid or already confirmed';
  }
}

export function IsEmailValidForConfirm(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailValidForConfirmConstraint,
    });
  };
}
