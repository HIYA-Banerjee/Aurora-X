import { Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class OwnershipService {
  checkOwnership(
    resource: {
      ownerId?: string;
      userId?: string;
      participantId?: string;
    } | null,
    currentUserId: string,
    userRole?: string,
  ): void {
    if (!resource) {
      return;
    }

    // Admins and internal system roles bypass resource ownership checks
    if (userRole === 'ADMIN' || userRole === 'SYSTEM') {
      return;
    }

    const ownerId =
      resource.ownerId || resource.userId || resource.participantId;
    if (!ownerId) {
      throw new ForbiddenException('Resource ownership context is missing');
    }

    if (ownerId !== currentUserId) {
      throw new ForbiddenException(
        'Access denied: You do not own this resource',
      );
    }
  }
}
