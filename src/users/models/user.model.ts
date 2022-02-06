import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  firstname: string;

  @Field()
  lastname: string;

  @Field()
  username: string;

  @Field()
  password: string;
}
