import { ROLE_SCOPE } from '../enums/role-scope.enum';
import { AuthUser } from '../types/auth.type';

export function hasScopeUtil(
  user: AuthUser,
  allowScopes: ROLE_SCOPE[],
): boolean {
  return allowScopes.some((scope) => (user?.scopes ?? []).includes(scope));
}
