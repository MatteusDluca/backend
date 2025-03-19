import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: { sub: string; email: string }) {
    const employee = await this.prisma.employee.findUnique({
      where: {
        id: payload.sub,
      },
    })

    if (!employee) {
      throw new UnauthorizedException('Usuário não encontrado')
    }

    return {
      id: employee.id,
      email: employee.email,
      name: employee.name,
    }
  }
}
