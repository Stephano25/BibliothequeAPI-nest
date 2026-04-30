import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Subscriptions')
@Controller('v1/subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('payment-intent')
  @ApiOperation({ summary: 'Create a Stripe PaymentIntent' })
  async createPaymentIntent(@Request() req) {
    return this.subscriptionsService.createPaymentIntent(req.user.id);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get user subscription status' })
  async getStatus(@Request() req) {
    return this.subscriptionsService.getStatus(req.user.id);
  }
}