
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByCognitoSub(cognitoSub: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        cognitoSub,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'User account not found or inactive',
      );
    }

    return user;
  }
}
