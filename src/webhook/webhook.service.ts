import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async handleStripeWebhook(payload: any, signature: string): Promise<boolean> {
    // Parser le payload
    let event;
    try {
      event = typeof payload === 'string' ? JSON.parse(payload) : payload;
    } catch (error) {
      console.log('Error parsing webhook payload');
      return true;
    }
    
    // Traiter l'événement
    if (event.type === 'payment_intent.succeeded') {
      const userId = event.data?.object?.metadata?.user_id;
      if (userId) {
        const user = await this.userRepository.findOne({ where: { id: parseInt(userId) } });
        if (user) {
          user.subscription_status = 'premium';
          await this.userRepository.save(user);
          console.log(`✅ User ${userId} upgraded to premium via webhook`);
        }
      }
    }
    
    return true;
  }
}