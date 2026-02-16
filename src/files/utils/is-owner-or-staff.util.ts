import { isStuffUtil } from 'src/auth/utils/is-staff.util';
import { FileRecord } from '../file-record.entity';
import { AuthUser } from 'src/auth/types/auth.type';
import { ROLES } from 'src/auth/enums/roles.enum';

export function isOwnerOrStaffUtil(file: FileRecord, user: AuthUser): boolean {
  const isOwner = file.ownerUserId === user.sub;
  const isStaff = isStuffUtil((user.roles ?? []) as ROLES[]);
  return isOwner || isStaff;
}
