import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BooksService } from './books.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Books')
@Controller('v1/books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get book summary' })
  async getSummary(@Param('id') id: string) {
    return this.booksService.getSummary(+id);
  }

  @Post(':id/summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate book summary using OpenAI' })
  async generateSummary(@Param('id') id: string, @Request() req) {
    return this.booksService.generateSummary(+id, req.user.id);
  }

  @Post('smart-search')
  @ApiOperation({ summary: 'Intelligent search using OpenAI' })
  async smartSearch(@Body('description') description: string) {
    return this.booksService.smartSearch(description);
  }
}