import { SetMetadata } from '@nestjs/common';
import { GymRole, Permission } from '../rbac/rbac.constants';

export const REQUIRE_GYM_ROLE_KEY = 'requireGymRole';
export const REQUIRE_PERMISSIONS_KEY = 'requirePermissions';

export interface GymRoleRequirement {
  roles?: GymRole[];
  permissions?: Permission[];
}

export const RequireGymRole = (requirement: GymRoleRequirement) =>
  SetMetadata(REQUIRE_GYM_ROLE_KEY, requirement);
