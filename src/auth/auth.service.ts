import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ErrorMessages } from '../common/consts';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { LoginResponse } from './dto/login.response';
import { SignupInput } from './dto/signup.input';
import { SignupResponse } from './dto/signup.response';


@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService, private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  async signup({ firstname, lastname, username, password }: SignupInput): Promise<SignupResponse> {
    await this.usersService.create({ firstname, lastname, username, password });
    return {
      message: "User created successfully!"
    };
  }

  async login(user: User): Promise<LoginResponse> {
    const token = {
      id: user.id,
      username: user.username
    };
    return {
      accessToken: this.jwtService.sign(token)
    };
  }

  validate(username: string, password: string): User | null {
    const user: User = this.usersService.getByUsername(username);

    if (!user) return null;

    const passwordIsValid = password === user.password;
    return passwordIsValid ? user : null;
  }

  verify(token: string): User {
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_SECRET')
    });

    const user = this.usersService.get(decoded.userId);

    if (!user) throw new UnauthorizedException(ErrorMessages.unvalid_token);

    return user;
  }
}
