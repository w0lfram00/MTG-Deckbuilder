import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getEnv } from './getEnv';
import { UserData } from '@app/auth/dto/auth';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: getEnv('JWT_SECRET_ACCESS'),
    });
  }

  validate(payload: UserData) {
    return payload;
  }
}
