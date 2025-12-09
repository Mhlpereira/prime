import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_GYM_ROLE_KEY, GymRoleRequirement } from '../decorator/require-gym-role.decorator';
import { IS_PUBLIC_KEY } from '../decorator/isPublic.decorator';
import { GymRole, hasHigherOrEqualRole, hasPermission, hasPermissions } from '../rbac/rbac.constants';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GymRoleGuard implements CanActivate {
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

    const requirement = this.reflector.getAllAndOverride<GymRoleRequirement>(
      REQUIRE_GYM_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requirement || (!requirement.roles && !requirement.permissions)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const gymId = this.extractGymId(request);

    if (!gymId) {
      throw new BadRequestException('gymId não encontrado na requisição');
    }

    const userGym = await this.findUserGymRole(user.sub, gymId);

    if (!userGym) {
      throw new ForbiddenException('Você não tem acesso a este gym');
    }

    const userRole = userGym.role as GymRole;

    if (requirement.roles && requirement.roles.length > 0) {
      const hasRequiredRole = requirement.roles.some(requiredRole =>
        hasHigherOrEqualRole(userRole, requiredRole)
      );

      if (!hasRequiredRole) {
        throw new ForbiddenException(
          `Acesso negado. Role necessária: ${requirement.roles.join(' ou ')}. Seu role: ${userRole}`
        );
      }
    }

    if (requirement.permissions && requirement.permissions.length > 0) {
      const hasRequiredPermissions = hasPermissions(userRole, requirement.permissions);

      if (!hasRequiredPermissions) {
        throw new ForbiddenException(
          `Acesso negado. Você não tem as permissões necessárias com o role ${userRole}`
        );
      }
    }

    request.gymRole = userRole;
    request.gymId = gymId;

    return true;
  }

  private extractGymId(request: any): string | null {
    if (request.params?.gymId) {
      return request.params.gymId;
    }

    if (request.params?.id && request.route?.path?.includes('/gym')) {
      return request.params.id;
    }

    if (request.body?.gymId) {
      return request.body.gymId;
    }

    if (request.query?.gymId) {
      return request.query.gymId;
    }

    return null;
  }

  private async findUserGymRole(userId: string, gymId: string) {
    const userGym = await this.prisma.userGym.findFirst({
      where: {
        userId,
        gymId,
      },
    });

    if (userGym) {
      return userGym;
    }

    const team = await this.prisma.gymTeam.findUnique({
      where: { id: gymId },
      select: { gymId: true, sportId: true },
    });

    if (team) {
      return this.prisma.userGym.findUnique({
        where: {
          userId_gymId_sportId: {
            userId,
            gymId: team.gymId,
            sportId: team.sportId,
          },
        },
      });
    }

    return null;
  }
}
