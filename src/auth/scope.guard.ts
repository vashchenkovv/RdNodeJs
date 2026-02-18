import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AuthUser } from './types/auth.type';
import { SCOPES_KEY } from './scopes.decorator';

@Injectable()
export class ScopesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(
      SCOPES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredScopes || requiredScopes.length === 0) {
      return true;
    }

    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();

    const userScopes = req.user?.scopes ?? [];

    if (!requiredScopes.some((scope) => userScopes.includes(scope))) {
      throw new ForbiddenException('Forbidden');
    }

    return true;
  }
}
