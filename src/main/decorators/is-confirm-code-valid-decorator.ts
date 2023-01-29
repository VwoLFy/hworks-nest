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
export class IsConfirmCodeValidConstraint implements ValidatorConstraintInterface {
  constructor(protected usersRepository: UsersRepository) {}

  async validate(value: string) {
    const foundUser = await this.usersRepository.findUserByConfirmationCode(value);
    if (!foundUser) return false;
    const { emailConfirmation } = foundUser;
    if (emailConfirmation.isConfirmed) return false;
    if (emailConfirmation.expirationDate < new Date()) return false;
    if (emailConfirmation.confirmationCode !== value) return false;
    return true;
  }

  defaultMessage() {
    return `Code isn't valid`;
  }
}

export function IsConfirmCodeValid(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsConfirmCodeValidConstraint,
    });
  };
}
