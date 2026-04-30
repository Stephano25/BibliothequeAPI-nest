import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './entities/author.entity';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
  ) {}

  async findAll(): Promise<Author[]> {
    return this.authorRepository.find({ relations: ['books'] });
  }

  async findOne(id: number): Promise<Author> {
    return this.authorRepository.findOne({ where: { id }, relations: ['books'] });
  }

  async create(data: Partial<Author>): Promise<Author> {
    const author = this.authorRepository.create(data);
    return this.authorRepository.save(author);
  }
}