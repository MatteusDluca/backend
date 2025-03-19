import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const userId = request.user.id

    // Find the employee with their role
    const employee = await this.prisma.employee.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!employee) {
      return false
    }

    return requiredRoles.includes(employee.role)
  }
}
