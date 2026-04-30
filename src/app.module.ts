import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { AuthorsModule } from './authors/authors.module';
import { BorrowsModule } from './borrows/borrows.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { WebhookModule } from './webhook/webhook.module';
import { SeedService } from './seeds/seed.service';
import { User } from './auth/entities/user.entity';
import { Author } from './authors/entities/author.entity';
import { Book } from './books/entities/book.entity';
import { Borrow } from './borrows/entities/borrow.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Author, Book, Borrow],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Author, Book, Borrow]),
    AuthModule,
    BooksModule,
    AuthorsModule,
    BorrowsModule,
    SubscriptionsModule,
    WebhookModule,
  ],
  providers: [SeedService],
})
export class AppModule {}