import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MoveResponse {
  @Field()
  message: string;
}
