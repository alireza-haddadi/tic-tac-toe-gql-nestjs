import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SignupResponse {
  @Field()
  message: string;
}
