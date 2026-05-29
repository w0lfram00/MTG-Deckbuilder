import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getEnv } from './getEnv';
import createHttpError from 'http-errors';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req: Request) => {
					console.log(req?.cookies?.refreshToken);

					return req?.cookies?.refreshToken;
				},
			]),
			secretOrKey: getEnv('JWT_SECRET_ACCESS'),
			passReqToCallback: true,
		});
	}

	async validate(req: Request, payload: JwtPayload) {
		const refreshToken = req.cookies?.refreshToken;
		if (!refreshToken) {
			throw createHttpError(403, 'Unauthorized');
		}
		return { ...payload, refreshToken };
	}
}
