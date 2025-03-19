/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateEmployee(loginDto: LoginDto) {
    // Busca funcionário pelo email
    const employee = await this.prisma.employee.findUnique({
      where: { email: loginDto.email },
    })

    if (!employee) {
      throw new UnauthorizedException('Credenciais inválidas')
    }

    // Verifica se o CPF informado corresponde ao CPF do funcionário
    if (employee.cpf !== loginDto.password) {
      throw new UnauthorizedException('Credenciais inválidas')
    }

    return employee
  }

  async login(loginDto: LoginDto) {
    const employee = await this.validateEmployee(loginDto)

    const payload = { sub: employee.id, email: employee.email }

    return {
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
      },
      access_token: this.jwtService.sign(payload),
    }
  }
}
