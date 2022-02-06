import { Field, ObjectType } from '@nestjs/graphql';
import { GameMode, GameStatus } from 'src/common/consts';

@ObjectType()
export class Game {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field(() => String)
  mode: GameMode;

  @Field(() => String)
  status: GameStatus;

  @Field()
  next: string;

  @Field()
  winner: string;

  @Field(() => [String], { nullable: true })
  players: string[];

  @Field(() => [String], { nullable: true })
  moves: string[];
}
