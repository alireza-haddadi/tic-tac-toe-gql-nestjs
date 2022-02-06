import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../common/current-user.decorator';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { User } from '../users/models/user.model';
import { SignupInput } from './dto/signup.input';
import { SignupResponse } from './dto/signup.response';
import { LoginResponse } from './dto/login.response';
import { AuthService } from './auth.service';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => SignupResponse)
  async signup(@Args('data') { firstname, lastname, username, password }: SignupInput): Promise<SignupResponse> {
    const response = await this.authService.signup({ firstname, lastname, username, password });
    return response;
  }

  @Mutation(() => LoginResponse)
  @UseGuards(LocalAuthGuard)
  async login(@Args('username') username: string, @Args('password') password: string, @CurrentUser() user: User): Promise<LoginResponse> {
    const response = await this.authService.login(user);
    return response;
  }
}
