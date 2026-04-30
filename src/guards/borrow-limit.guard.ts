import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Borrow } from '../borrows/entities/borrow.entity';

@Injectable()
export class BorrowLimitGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Borrow)
    private borrowRepository: Repository<Borrow>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    
    if (!userId) {
      throw new ForbiddenException('Non authentifié');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new ForbiddenException('Utilisateur non trouvé');
    }

    if (user.subscription_status === 'premium') {
      return true;
    }

    const activeBorrows = await this.borrowRepository.count({
      where: {
        user_name: user.name,
        returned_at: null,
      },
    });

    if (activeBorrows >= 2) {
      throw new ForbiddenException({
        success: false,
        message: 'Limite d\'emprunts atteinte (maximum 2 pour les utilisateurs free). Passez à premium pour des emprunts illimités.',
        data: {
          current_borrows: activeBorrows,
          max_borrows: 2,
          subscription_status: user.subscription_status,
          upgrade_needed: true,
        },
      });
    }

    return true;
  }
}