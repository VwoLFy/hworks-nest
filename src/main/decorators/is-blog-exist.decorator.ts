import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsQueryRepo } from '../../modules/blogs/infrastructure/blogs.queryRepo';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsBlogExistConstraint implements ValidatorConstraintInterface {
  constructor(protected blogsQueryRepo: BlogsQueryRepo) {}

  async validate(value: string) {
    const foundBlog = await this.blogsQueryRepo.findBlogById(value);
    return !!foundBlog;
  }

  defaultMessage() {
    return `BlogId isn't exist`;
  }
}

export function IsBlogExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBlogExistConstraint,
    });
  };
}
