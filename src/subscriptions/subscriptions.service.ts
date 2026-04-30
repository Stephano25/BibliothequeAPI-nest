import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { StripeService } from '../services/stripe.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private stripeService: StripeService,
  ) {}

  async createPaymentIntent(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    if (user.subscription_status === 'premium') {
      throw new BadRequestException('Vous êtes déjà abonné premium');
    }

    const paymentIntent = await this.stripeService.createPaymentIntent(
      userId,
      user.email,
    );

    return {
      success: true,
      data: {
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        publishable_key: this.stripeService.getPublishableKey(),
        payment_intent_id: paymentIntent.id,
      },
    };
  }

  async getStatus(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    const borrowsService = require('../borrows/borrows.service');
    const activeBorrows = await new borrowsService(null, null, null).getActiveBorrowsCount(user.name);

    return {
      success: true,
      data: {
        subscription_status: user.subscription_status,
        user_id: user.id,
        user_name: user.name,
        email: user.email,
        active_borrows: activeBorrows,
        max_borrows: user.subscription_status === 'premium' ? 'illimité' : 2,
      },
    };
  }

  async upgradeToPremium(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return false;

    user.subscription_status = 'premium';
    await this.userRepository.save(user);
    return true;
  }
}