import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Book } from '../../books/entities/book.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('borrows')
export class Borrow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_name: string;

  @Column({ nullable: false })  // Important: Ajouter nullable: false
  book_id: number;

  @Column({ type: 'datetime' })
  borrowed_at: Date;

  @Column({ type: 'datetime', nullable: true })
  returned_at: Date;

  @Column({ type: 'text', default: 'pending' })
  payment_status: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Book, (book) => book.borrows)
  book: Book;

  @ManyToOne(() => User, (user) => user.borrows)
  user: User;
}