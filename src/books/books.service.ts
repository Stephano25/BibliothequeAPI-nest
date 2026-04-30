import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { OpenAIService } from '../services/openai.service';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    private openAIService: OpenAIService,
  ) {}

  async getSummary(id: number) {
    const book = await this.bookRepository.findOne({ 
      where: { id }, 
      relations: ['author'] 
    });
    
    if (!book) {
      throw new NotFoundException('Livre non trouvé');
    }
    
    return {
      success: true,
      data: {
        summary: book.summary || 'Aucun résumé disponible',
        book_id: book.id,
        title: book.title,
        author: `${book.author.first_name} ${book.author.last_name}`,
      },
    };
  }

  async generateSummary(id: number, userId: number) {
    const book = await this.bookRepository.findOne({ 
      where: { id }, 
      relations: ['author'] 
    });
    
    if (!book) {
      throw new NotFoundException('Livre non trouvé');
    }
    
    if (book.summary) {
      return {
        success: true,
        data: {
          summary: book.summary,
          generated_by: 'existing',
        },
      };
    }
    
    try {
      const authorName = `${book.author.first_name} ${book.author.last_name}`;
      const summary = await this.openAIService.generateSummary(
        book.title,
        authorName,
        book.year,
      );
      
      book.summary = summary;
      await this.bookRepository.save(book);
      
      return {
        success: true,
        data: {
          summary,
          generated_by: 'openai',
        },
      };
    } catch (error) {
      throw new ServiceUnavailableException('Service OpenAI indisponible');
    }
  }

  async smartSearch(description: string) {
    try {
      const keywords = await this.openAIService.extractKeywords(description);
      
      const query = this.bookRepository.createQueryBuilder('book')
        .leftJoinAndSelect('book.author', 'author');
      
      if (keywords.length > 0) {
        keywords.forEach((keyword: string) => {
          query.orWhere('book.title LIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('author.first_name LIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('author.last_name LIKE :keyword', { keyword: `%${keyword}%` });
        });
      }
      
      const books = await query.take(20).getMany();
      
      return {
        success: true,
        data: {
          keywords,
          results: books.map((book) => ({
            id: book.id,
            title: book.title,
            author: `${book.author.first_name} ${book.author.last_name}`,
            year: book.year,
            summary: book.summary,
            available: book.available,
          })),
        },
      };
    } catch (error) {
      throw new ServiceUnavailableException('Erreur de recherche intelligente');
    }
  }
}