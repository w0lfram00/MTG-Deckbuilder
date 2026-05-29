import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetRt = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		const user = request.user;
		return {
			id: user.sub,
			email: user.email,
			refreshToken: user.refreshToken,
		};
	},
);

export type GetRefreshToken = {
	id: string;
	email: string;
	refreshToken: string;
};
