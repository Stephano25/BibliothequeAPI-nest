import { Controller, Post, Headers, Req, HttpCode, Body } from '@nestjs/common';
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
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
    @Body() body: any,
  ) {
    // Utiliser le body JSON directement
    const payload = JSON.stringify(body);
    
    await this.webhookService.handleStripeWebhook(payload, signature);
    return { received: true };
  }
}