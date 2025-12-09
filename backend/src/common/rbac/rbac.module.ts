import { Module, Global } from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';
import { GymRoleGuard } from '../guards/gym-role.guard';
import { PrismaModule } from '../../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [RolesGuard, GymRoleGuard],
  exports: [RolesGuard, GymRoleGuard],
})
export class RbacModule {}
