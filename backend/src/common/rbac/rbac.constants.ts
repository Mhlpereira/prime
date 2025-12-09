export enum Permission {
  GYM_CREATE = 'gym:create',
  GYM_READ = 'gym:read',
  GYM_UPDATE = 'gym:update',
  GYM_DELETE = 'gym:delete',
  GYM_MANAGE_USERS = 'gym:manage_users',
  
  TEAM_CREATE = 'team:create',
  TEAM_READ = 'team:read',
  TEAM_UPDATE = 'team:update',
  TEAM_DELETE = 'team:delete',
  
  CLASS_CREATE = 'class:create',
  CLASS_READ = 'class:read',
  CLASS_UPDATE = 'class:update',
  CLASS_DELETE = 'class:delete',
  CLASS_MANAGE_ATTENDANCE = 'class:manage_attendance',
  
  GRADUATION_CREATE = 'graduation:create',
  GRADUATION_READ = 'graduation:read',
  GRADUATION_UPDATE = 'graduation:update',
  GRADUATION_DELETE = 'graduation:delete',
  
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
}

export enum GymRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  PROFESSOR = 'PROFESSOR',
  STUDENT = 'STUDENT',
}

export const ROLE_PERMISSIONS: Record<GymRole, Permission[]> = {
  [GymRole.ADMIN]: [
    // Gym
    Permission.GYM_CREATE,
    Permission.GYM_READ,
    Permission.GYM_UPDATE,
    Permission.GYM_DELETE,
    Permission.GYM_MANAGE_USERS,
    
    // Team
    Permission.TEAM_CREATE,
    Permission.TEAM_READ,
    Permission.TEAM_UPDATE,
    Permission.TEAM_DELETE,
    
    // Class
    Permission.CLASS_CREATE,
    Permission.CLASS_READ,
    Permission.CLASS_UPDATE,
    Permission.CLASS_DELETE,
    Permission.CLASS_MANAGE_ATTENDANCE,
    
    // Graduation
    Permission.GRADUATION_CREATE,
    Permission.GRADUATION_READ,
    Permission.GRADUATION_UPDATE,
    Permission.GRADUATION_DELETE,
    
    // User
    Permission.USER_READ,
    Permission.USER_UPDATE,
  ],
  
  [GymRole.MANAGER]: [
    // Gym (sem criar/deletar)
    Permission.GYM_READ,
    Permission.GYM_UPDATE,
    Permission.GYM_MANAGE_USERS,
    
    // Team
    Permission.TEAM_CREATE,
    Permission.TEAM_READ,
    Permission.TEAM_UPDATE,
    Permission.TEAM_DELETE,
    
    // Class
    Permission.CLASS_CREATE,
    Permission.CLASS_READ,
    Permission.CLASS_UPDATE,
    Permission.CLASS_DELETE,
    Permission.CLASS_MANAGE_ATTENDANCE,
    
    // Graduation
    Permission.GRADUATION_CREATE,
    Permission.GRADUATION_READ,
    Permission.GRADUATION_UPDATE,
    
    // User
    Permission.USER_READ,
  ],
  
  [GymRole.PROFESSOR]: [
    Permission.GYM_READ,
    
    Permission.TEAM_READ,
    
    Permission.CLASS_CREATE,
    Permission.CLASS_READ,
    Permission.CLASS_UPDATE,
    Permission.CLASS_MANAGE_ATTENDANCE,
    
    Permission.GRADUATION_CREATE,
    Permission.GRADUATION_READ,
    
    Permission.USER_READ,
  ],
  
  [GymRole.STUDENT]: [
    Permission.GYM_READ,
    
    Permission.TEAM_READ,
    
    Permission.CLASS_READ,
    
    Permission.GRADUATION_READ,
    
    Permission.USER_READ,
  ],
};

export const ROLE_HIERARCHY: Record<GymRole, number> = {
  [GymRole.ADMIN]: 4,
  [GymRole.MANAGER]: 3,
  [GymRole.PROFESSOR]: 2,
  [GymRole.STUDENT]: 1,
};

export function hasPermission(role: GymRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasHigherOrEqualRole(userRole: GymRole, requiredRole: GymRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function hasPermissions(role: GymRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}
