import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const SessionData = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req: Request = ctx.switchToHttp().getRequest();
  return req.sessionData;
});
