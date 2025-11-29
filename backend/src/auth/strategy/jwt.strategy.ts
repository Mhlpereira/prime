import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

import { Request } from "express";

function cookieExtractor(req: Request): string | null {
    if (req && req.cookies && req.cookies['access_token']) {
        return req.cookies['access_token'];
    }
    return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                cookieExtractor,
                ExtractJwt.fromAuthHeaderAsBearerToken()
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') as string
        });
    }
    async validate(payload: any) {
        return {
            sub: payload.sub,
            email: payload.email,
            roles: payload.roles,
            exp: payload.exp
        };
    }
}