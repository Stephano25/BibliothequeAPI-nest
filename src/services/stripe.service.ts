// src/services/stripe.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe | null = null;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get('STRIPE_SECRET_KEY');
    if (secretKey && !secretKey.includes('dummy') && secretKey.startsWith('sk_')) {
      this.stripe = new Stripe(secretKey, {
        // Correction : utiliser une version API valide
        apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
      });
    }
  }

  async createPaymentIntent(userId: number, userEmail: string, amount: number = 500, currency: string = 'eur') {
    // Mode mock pour les tests sans Stripe
    if (!this.stripe) {
      return {
        id: `pi_mock_${Date.now()}`,
        client_secret: `pi_mock_${Date.now()}_secret_mock`,
        amount: amount,
        currency: currency,
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

  constructWebhookEvent(payload: string | Buffer, signature: string, webhookSecret: string): Stripe.Event {
    if (!this.stripe || webhookSecret === 'whsec_dummy') {
      return JSON.parse(payload.toString()) as Stripe.Event;
    }
    
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  getPublishableKey(): string {
    return this.configService.get('STRIPE_PUBLISHABLE_KEY', 'pk_test_dummy');
  }
}