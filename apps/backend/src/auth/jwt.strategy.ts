import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super_secret_jwt_key_for_slooze',
    });
  }

  async validate(payload: {
    sub?: string;
    userId?: string;
    email: string;
    role: string;
    regionId: string;
  }) {
    const id = payload.sub || payload.userId;
    if (!id) {
      throw new UnauthorizedException();
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { region: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    // Pass user object to request
    return {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      regionId: user.regionId,
      region: user.region,
    };
  }
}
