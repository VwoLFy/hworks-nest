import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint()
@Injectable()
export class IsArrayStrOrNumDecorator implements ValidatorConstraintInterface {
  async validate(value: any[]) {
    return Array.isArray(value) && value.every((v) => typeof v === 'number' || (typeof v === 'string' && v.trim()));
  }

  defaultMessage() {
    return `value must be an array with strings or numbers values`;
  }
}

export function IsArrayStrOrNum(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsArrayStrOrNumDecorator,
    });
  };
}
