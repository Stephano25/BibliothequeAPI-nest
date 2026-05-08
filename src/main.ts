import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Important pour Stripe
  });
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  
  const config = new DocumentBuilder()
    .setTitle('Bibliothèque API')
    .setDescription('API de gestion de bibliothèque avec OpenAI et Stripe')
    .setVersion('2.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(3000);
  console.log(`✅ Application running on: http://localhost:3000/api`);
  console.log(`📚 Swagger UI: http://localhost:3000/api/docs`);
  console.log(`💳 Stripe webhook: http://localhost:3000/api/v1/webhooks/stripe`);
}
bootstrap();