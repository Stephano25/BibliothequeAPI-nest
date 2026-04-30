import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowsController } from './borrows.controller';
import { BorrowsService } from './borrows.service';
import { Borrow } from './entities/borrow.entity';
import { Book } from '../books/entities/book.entity';
import { User } from '../auth/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { BorrowLimitGuard } from '../guards/borrow-limit.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Borrow, Book, User]), AuthModule],
  controllers: [BorrowsController],
  providers: [BorrowsService, BorrowLimitGuard],
  exports: [BorrowsService],
})
export class BorrowsModule {}