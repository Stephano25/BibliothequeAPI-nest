import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Authors')
@Controller('v1/authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all authors' })
  async findAll() {
    const authors = await this.authorsService.findAll();
    return { success: true, data: authors };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get author by id' })
  async findOne(@Param('id') id: string) {
    const author = await this.authorsService.findOne(+id);
    return { success: true, data: author };
  }

  @Post()
  @ApiOperation({ summary: 'Create author' })
  async create(@Body() data: any) {
    const author = await this.authorsService.create(data);
    return { success: true, data: author };
  }
}