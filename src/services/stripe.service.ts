import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get('STRIPE_SECRET_KEY');
    if (secretKey && secretKey !== 'sk_test_dummy') {
      // Correction: Utiliser une version d'API valide
      this.stripe = new Stripe(secretKey, { 
        apiVersion: '2023-10-16' as Stripe.LatestApiVersion
      });
    }
  }

  async createPaymentIntent(userId: number, userEmail: string, amount: number = 500, currency: string = 'eur') {
    if (process.env.STRIPE_SECRET_KEY === 'sk_test_dummy') {
      return {
        client_secret: `pi_mock_${Date.now()}_secret_mock`,
        amount,
        currency,
        id: `pi_mock_${Date.now()}`,
      };
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        user_id: userId.toString(),
        user_email: userEmail,
        plan: 'premium',
      },
      description: 'Abonnement premium bibliothèque - 5€/mois',
    });

    return paymentIntent;
  }

  constructWebhookEvent(payload: any, signature: string, webhookSecret: string): Stripe.Event {
    if (webhookSecret === 'whsec_dummy') {
      return typeof payload === 'string' ? JSON.parse(payload) : payload;
    }

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  getPublishableKey(): string {
    return this.configService.get('STRIPE_PUBLISHABLE_KEY', 'pk_test_dummy');
  }
}