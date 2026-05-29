import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;
  return {
    id: user.sub,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
});
