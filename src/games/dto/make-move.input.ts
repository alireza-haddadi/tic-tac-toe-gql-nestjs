import { Field, InputType } from '@nestjs/graphql';
import { Length } from 'class-validator';

@InputType()
export class MakeMoveInput {
  @Field()
  gameId: string;

  @Field()
  @Length(1, 20)
  row: string;

  @Field()
  col: string;
}
