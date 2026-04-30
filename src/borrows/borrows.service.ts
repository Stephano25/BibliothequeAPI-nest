import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Borrow } from './entities/borrow.entity';
import { Book } from '../books/entities/book.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class BorrowsService {
  constructor(
    @InjectRepository(Borrow)
    private borrowRepository: Repository<Borrow>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getActiveBorrowsCount(userName: string): Promise<number> {
    return this.borrowRepository.count({
      where: { user_name: userName, returned_at: null },
    });
  }

  async borrow(userId: number, bookId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException('Livre non trouvé');
    }

    if (!book.available) {
      throw new ForbiddenException('Ce livre n\'est pas disponible');
    }

    const borrow = this.borrowRepository.create({
      user_name: user.name,
      book_id: bookId,
      borrowed_at: new Date(),
      payment_status: user.subscription_status === 'premium' ? 'paid' : 'free',
    });

    await this.borrowRepository.save(borrow);

    book.available = false;
    await this.bookRepository.save(book);

    const remainingBorrows = user.subscription_status === 'premium' 
      ? 'illimité' 
      : 2 - (await this.getActiveBorrowsCount(user.name));

    return {
      success: true,
      data: {
        borrow_id: borrow.id,
        user_name: borrow.user_name,
        book_title: book.title,
        borrowed_at: borrow.borrowed_at,
        remaining_borrows: remainingBorrows,
      },
    };
  }

  async returnBook(userId: number, borrowId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const borrow = await this.borrowRepository.findOne({
      where: { id: borrowId, user_name: user.name, returned_at: null },
      relations: ['book'],
    });

    if (!borrow) {
      throw new NotFoundException('Emprunt non trouvé ou déjà retourné');
    }

    borrow.returned_at = new Date();
    await this.borrowRepository.save(borrow);

    const book = borrow.book;
    book.available = true;
    await this.bookRepository.save(book);

    return {
      success: true,
      message: 'Livre retourné avec succès',
      data: {
        book_title: book.title,
        returned_at: borrow.returned_at,
      },
    };
  }
}