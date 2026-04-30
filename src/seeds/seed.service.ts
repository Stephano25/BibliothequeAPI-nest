import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity';
import { Author } from '../authors/entities/author.entity';
import { Book } from '../books/entities/book.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const userCount = await this.userRepository.count();
    if (userCount > 0) return;

    // Create users
    const users = [
      { name: 'Jean Dupont', email: 'jean@example.com', password: await bcrypt.hash('password123', 10), subscription_status: 'free' },
      { name: 'Marie Martin', email: 'marie@example.com', password: await bcrypt.hash('password123', 10), subscription_status: 'premium' },
      { name: 'Pierre Durand', email: 'pierre@example.com', password: await bcrypt.hash('password123', 10), subscription_status: 'free' },
    ];

    for (const user of users) {
      await this.userRepository.save(user);
    }

    // Create authors
    const authors = [
      { first_name: 'Victor', last_name: 'Hugo', nationality: 'Française' },
      { first_name: 'George', last_name: 'Orwell', nationality: 'Britannique' },
      { first_name: 'Jane', last_name: 'Austen', nationality: 'Britannique' },
      { first_name: 'Albert', last_name: 'Camus', nationality: 'Française' },
      { first_name: 'Haruki', last_name: 'Murakami', nationality: 'Japonaise' },
    ];

    for (const author of authors) {
      await this.authorRepository.save(author);
    }

    // Create books
    const books = [
      { title: 'Les Misérables', isbn: '9780451525260', year: 1862, authorId: 1 },
      { title: '1984', isbn: '9780451524935', year: 1949, authorId: 2 },
      { title: 'Orgueil et Préjugés', isbn: '9780141439518', year: 1813, authorId: 3 },
      { title: "L'Étranger", isbn: '9782070360024', year: 1942, authorId: 4 },
      { title: 'Kafka sur le rivage', isbn: '9780099458326', year: 2002, authorId: 5 },
    ];

    for (const book of books) {
      await this.bookRepository.save(book);
    }

    console.log('Database seeded successfully!');
  }
}