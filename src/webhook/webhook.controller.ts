// src/webhook/webhook.controller.ts
import { Controller, Post, Headers, Req, HttpCode, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { WebhookService } from './webhook.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Webhook')
@Controller('v1/webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('stripe')
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook reçu avec succès' })
  @ApiResponse({ status: 401, description: 'Signature invalide' })
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    // Utiliser rawBody pour Stripe
    const payload = req.rawBody;
    
    if (!payload) {
      return { received: false, error: 'No raw body' };
    }
    
    await this.webhookService.handleStripeWebhook(payload, signature);
    return { received: true };
  }
}