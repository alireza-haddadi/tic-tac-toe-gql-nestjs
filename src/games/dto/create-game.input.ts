import { Field, InputType } from '@nestjs/graphql';
import { Length } from 'class-validator';
import { GameMode } from 'src/common/consts';
import { registerEnumType } from "@nestjs/graphql";

registerEnumType(GameMode, {
  name: "GameMode",
  description: "Different types of game mode",
});

@InputType()
export class CreateGameInput {
  @Field({nullable: false})
  @Length(1, 20)
  title: string

  @Field(()=> GameMode)
  mode: GameMode;
}
