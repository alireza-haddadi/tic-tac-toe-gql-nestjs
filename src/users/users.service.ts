import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ErrorMessages } from '../common/consts';
import { StorageService } from '../storage/storage.service';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './models/user.model';

@Injectable()
export class UsersService {
  constructor(private readonly storageService: StorageService<User & { type: string }>) {
    this.storageService.set('e63afa5d-ecfe-4105-8d58-62gggf378301', {
      id: 'e63afa5d-ecfe-4105-8d58-62gggf378301',
      firstname: 'Alireza',
      lastname: 'Haddadi',
      username: 'alireza',
      password: '123456',
      type: 'user'
    });
  }

  create({ firstname, lastname, username, password }: CreateUserInput): User {
    const _user = this.getByUsername(username);
    if (_user) throw new BadRequestException(ErrorMessages.username_not_available);

    const user = {
      id: uuidv4(),
      firstname,
      lastname,
      username,
      password,
      type: 'user'
    };
    return this.storageService.set(user.id, user);
  }

  get(userId: string): User {
    const user: User = this.storageService.get(userId);
    return user;
  }

  getByUsername(username: string): User {
    let _user;
    const usersMap = this.storageService.getAll();
    const ite = usersMap.values();
    let _next = ite.next();
    while (!_next.done) {
      if (_next.value.username === username) {
        _user = _next.value;
        break;
      }
      _next = ite.next();
    }
    return _user;
  }
}
