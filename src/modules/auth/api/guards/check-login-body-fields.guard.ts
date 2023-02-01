import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { CredentialsDto } from '../../application/dto/CredentialsDto';
import { validate } from 'class-validator';

@Injectable()
export class CheckLoginBodyFieldsGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const object2 = plainToInstance(CredentialsDto, req.body);
    const res = await validate(object2, { stopAtFirstError: true });

    if (res.length > 0) {
      const error = res.map((e) => {
        const values = Object.values(e.constraints);
        return { field: e.property, message: values[0] };
      });
      throw new HttpException(error, 400);
    }

    return true;
  }
}
