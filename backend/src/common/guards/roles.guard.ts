import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorator/isPublic.decorator';
import { GymRole, hasHigherOrEqualRole } from '../rbac/rbac.constants';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<GymRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const userGyms = await this.prisma.userGym.findMany({
      where: { userId: user.sub },
      select: { role: true },
    });

    if (userGyms.length === 0) {
      throw new ForbiddenException('Usuário não possui nenhum role em nenhum gym');
    }

    const highestRole = this.getHighestRole(userGyms.map(ug => ug.role as GymRole));

    const hasAccess = requiredRoles.some(requiredRole =>
      hasHigherOrEqualRole(highestRole, requiredRole)
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        `Acesso negado. Role necessária: ${requiredRoles.join(' ou ')}. Seu role mais alto: ${highestRole}`
      );
    }

    return true;
  }

  private getHighestRole(roles: GymRole[]): GymRole {
    const roleOrder = [GymRole.ADMIN, GymRole.MANAGER, GymRole.PROFESSOR, GymRole.STUDENT];
    
    for (const role of roleOrder) {
      if (roles.includes(role)) {
        return role;
      }
    }
    
    return GymRole.STUDENT;
  }
}
