import { ROLES } from '../enums/roles.enum';

export function isStuffUtil(userRoles: ROLES[] | ROLES): boolean {
  const _userRoles = Array.isArray(userRoles) ? userRoles : [userRoles];
  return [ROLES.ACCOUNTER, ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPPORT].some(
    (role) => _userRoles.includes(role),
  );
}
