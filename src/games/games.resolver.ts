import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { CurrentUser } from '../common/current-user.decorator';
import { GameMode, GameStatus } from '../common/consts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/models/user.model';
import { CreateGameInput } from './dto/create-game.input';
import { MakeMoveInput } from './dto/make-move.input';
import { MoveResponse } from './dto/make-move.response';
import { Game } from './models/game.model';
import { Move } from './models/move.model';
import { GamesService } from './games.service';

const pubSub = new PubSub();

@Resolver(() => Game)
export class GamesResolver {
  constructor(private readonly gamesService: GamesService) {}

  @Mutation(() => Game)
  @UseGuards(JwtAuthGuard)
  async createGame(@Args('data') { title, mode }: CreateGameInput, @CurrentUser() user: User): Promise<Game> {
    const userId = user.id;
    return this.gamesService.create({ title, mode }, userId);
  }

  @Mutation(() => Game)
  @UseGuards(JwtAuthGuard)
  async joinGame(@Args('gameId') gameId: string, @CurrentUser() user: User): Promise<Game> {
    const userId = user.id;
    return this.gamesService.join(gameId, userId);
  }

  @Query(() => Game)
  @UseGuards(JwtAuthGuard)
  async getGame(@Args('id') id: string): Promise<Game> {
    const game = await this.gamesService.get(id);
    return game;
  }

  @Query(() => [Game])
  @UseGuards(JwtAuthGuard)
  async getGames(): Promise<Game[]> {
    const game = await this.gamesService.getAll();
    return game;
  }

  @Mutation(() => MoveResponse)
  @UseGuards(JwtAuthGuard)
  async playerMove(@Args('data') { gameId, row, col }: MakeMoveInput, @CurrentUser() user: User): Promise<MoveResponse> {
    const userId = user.id;

    let game = await this.gamesService.playerMove({ gameId, col, row }, userId);
    pubSub.publish('New_Move', { newMove: { gameId: game.id, ...JSON.parse(game.moves[game.moves.length - 1]) } });

    if (game.mode === GameMode.single && game.status !== GameStatus.finished) {
      game = await this.gamesService.botMove(gameId);
      pubSub.publish('New_Move', { newMove: { gameId: game.id, ...JSON.parse(game.moves[game.moves.length - 1]) } });
    }

    return { message: 'Successful move!' };
  }

  @Subscription(() => Move, {
    filter: (payload, variables) => {
      return payload.gameId !== variables.gameId;
    }
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  newMove(@Args('gameId') gameId: string): any {
    return pubSub.asyncIterator('New_Move');
  }
}
