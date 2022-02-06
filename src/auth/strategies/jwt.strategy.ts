import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (ctx: any) => {
          const headers = ctx?.req?.headers;
          let token = null;
          if (headers && headers.authorization && headers.authorization.startsWith('Bearer ')) {
            token = headers.authorization.split(' ').pop();
          }
          return token;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(configService.get<string>('JWT_SECRET'))
    });
  }

  validate(validationPayload: { id: string; username: string }): any {
    return { id: validationPayload.id, username: validationPayload.username };
  }
}
