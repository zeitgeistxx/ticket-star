import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from '../database.service';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly db: DatabaseService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const userId = authHeader.replace('Bearer mock-jwt-token-xyz-', '');
    if (!userId) {
      throw new UnauthorizedException('Invalid authorization token');
    }

    const user = Array.from(this.db.users.values()).find(u => u.id === userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    request.user = user;
    return true;
  }
}
