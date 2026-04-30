import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password, password_confirmation } = registerDto;
    
    if (password !== password_confirmation) {
      throw new ConflictException('Password confirmation does not match');
    }
    
    const existingUser = await this.userRepository.findOne({ 
      where: [{ email }, { name }] 
    });
    
    if (existingUser) {
      throw new ConflictException('User with this email or name already exists');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      subscription_status: 'free',
    });
    
    await this.userRepository.save(user);
    
    const token = this.jwtService.sign({ id: user.id, email: user.email });
    
    return {
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, subscription_status: user.subscription_status },
        token,
        token_type: 'Bearer',
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const token = this.jwtService.sign({ id: user.id, email: user.email });
    
    return {
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, subscription_status: user.subscription_status },
        token,
        token_type: 'Bearer',
      },
    };
  }
}