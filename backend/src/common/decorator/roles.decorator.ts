import { SetMetadata } from '@nestjs/common';
import { GymRole } from '../rbac/rbac.constants';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: GymRole[]) => SetMetadata(ROLES_KEY, roles);
