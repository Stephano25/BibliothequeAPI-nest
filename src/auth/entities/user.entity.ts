import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Borrow } from '../../borrows/entities/borrow.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'text', default: 'free' })
  subscription_status: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Borrow, (borrow) => borrow.user)
  borrows: Borrow[];
}