import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Move {
  @Field()
  row: string;

  @Field()
  col: string;

  @Field()
  playerId: string;

  @Field()
  gameId: string;
}
