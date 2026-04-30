import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BorrowsService } from './borrows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BorrowLimitGuard } from '../guards/borrow-limit.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Borrows')
@Controller('v1/borrows')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BorrowsController {
  constructor(private readonly borrowsService: BorrowsService) {}

  @Post()
  @UseGuards(BorrowLimitGuard)
  @ApiOperation({ summary: 'Borrow a book (limit 2 for free users)' })
  async borrow(@Request() req, @Body('book_id') bookId: number) {
    return this.borrowsService.borrow(req.user.id, bookId);
  }

  @Post(':id/return')
  @ApiOperation({ summary: 'Return a borrowed book' })
  async returnBook(@Request() req, @Param('id') id: string) {
    return this.borrowsService.returnBook(req.user.id, +id);
  }
}