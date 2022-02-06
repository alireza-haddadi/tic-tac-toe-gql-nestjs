import { Field, InputType } from '@nestjs/graphql';
import { Length } from 'class-validator';

@InputType()
export class SignupInput {
  @Field()
  firstname: string;

  @Field()
  lastname: string;

  @Field()
  @Length(1, 20)
  username: string;

  @Field()
  @Length(1, 20)
  password: string;
}
