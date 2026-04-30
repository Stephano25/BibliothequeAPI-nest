import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { StripeService } from '../services/stripe.service';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private stripeService: StripeService,
  ) {}

  async handleStripeWebhook(payload: any, signature: string): Promise<boolean> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    const event = this.stripeService.constructWebhookEvent(payload, signature, webhookSecret);
    
    if (event.type === 'payment_intent.succeeded') {
      // Correction: Convertir userId en nombre explicitement
      const userId = Number(event.data.object.metadata?.user_id);
      if (userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (user) {
          user.subscription_status = 'premium';
          await this.userRepository.save(user);
          console.log(`User ${userId} upgraded to premium`);
        }
      }
    }
    
    return true;
  }
}