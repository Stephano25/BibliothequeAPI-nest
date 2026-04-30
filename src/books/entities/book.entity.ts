import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Author } from '../../authors/entities/author.entity';
import { Borrow } from '../../borrows/entities/borrow.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  isbn: string;

  @Column()
  year: number;

  @Column({ default: true })
  available: boolean;

  @Column({ nullable: true, type: 'text' })
  summary: string;

  @ManyToOne(() => Author, (author) => author.books)
  author: Author;

  @Column()
  authorId: number;

  @OneToMany(() => Borrow, (borrow) => borrow.book)
  borrows: Borrow[];

  @CreateDateColumn()
  created_at: Date;
}