import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../storage/storage.service';
import { ErrorMessages, GameMode, GameStatus } from '../common/consts';
import { CreateGameInput } from './dto/create-game.input';
import { MakeMoveInput } from './dto/make-move.input';
import { Game } from './models/game.model';

@Injectable()
export class GamesService {
  constructor(private readonly storageService: StorageService<Game & { type: string }>) {
    this.storageService.set('838dc064-c528-4391-a0df-b2d7adb6493b', {
      id: '838dc064-c528-4391-a0df-b2d7adb6493b',
      title: 'First Game',
      mode: GameMode.single,
      status: GameStatus.pending,
      next: '',
      winner: '',
      players: ['e63afa5d-ecfe-4105-8d58-62gggf378301', 'bot'],
      moves: [],
      type: 'game'
    });
  }

  async create({ title, mode }: CreateGameInput, playerId: string): Promise<Game> {
    const _game = await this.getByTitle(title);
    if (_game) throw new BadRequestException(ErrorMessages.title_is_taken);

    const game = {
      id: uuidv4(),
      title,
      mode,
      status: GameStatus.pending,
      next: playerId,
      winner: '',
      players: [playerId, mode === GameMode.single ? 'bot' : ''],
      moves: [],
      type: 'game'
    };
    return this.storageService.set(game.id, game);
  }

  async join(gameId: string, playerId: string): Promise<Game> {
    const game = this.storageService.get(gameId);
    if (!game) throw new NotFoundException(ErrorMessages.game_not_found);
    if (game.players[0] === playerId || game.players[1] === playerId) throw new BadRequestException(ErrorMessages.already_joined);
    if (game.mode !== GameMode.multi || game.players[1] !== '') throw new BadRequestException(ErrorMessages.not_able_to_join);

    game.players[1] = playerId;

    return this.storageService.set(gameId, game);
  }

  async get(gameId: string): Promise<Game> {
    const game: Game = this.storageService.get(gameId);
    return game;
  }

  async getAll(): Promise<Game[]> {
    const games = [];
    const gamesMap = this.storageService.getAll();
    const ite = gamesMap.values();
    let _next = ite.next();
    while (!_next.done) {
      if (_next.value.type === 'game') games.push(_next.value);
      _next = ite.next();
    }

    return games;
  }

  async getByTitle(title: string): Promise<Game> {
    let _game;
    const gamesMap = this.storageService.getAll();
    const ite = gamesMap.values();
    let _next = ite.next();
    while (!_next.done) {
      if (_next.value.title === title) {
        _game = _next.value;
        break;
      }
      _next = ite.next();
    }
    return _game;
  }

  async playerMove({ gameId, col, row }: MakeMoveInput, playerId: string): Promise<Game> {
    const game = this.storageService.get(gameId);
    if (!game) throw new NotFoundException(ErrorMessages.game_not_found);

    this._beforeMove(game, row, col, playerId);
    game.moves.push(JSON.stringify({ row, col, playerId }));
    this._afterMove(game);

    return this.storageService.set(gameId, game);
  }

  async botMove(gameId: string): Promise<Game> {
    const game = this.storageService.get(gameId);
    if (!game) throw new NotFoundException(ErrorMessages.game_not_found);

    const availMoves = this._availableMoves(game);
    const randMove = availMoves[Math.floor(Math.random() * availMoves.length)];

    game.moves.push(JSON.stringify({ row: randMove.charAt(0), col: randMove.charAt(1), playerId: 'bot' }));
    this._afterMove(game);

    return this.storageService.set(gameId, game);
  }

  _beforeMove(game: Game, row: string, col: string, playerId: string): void {
    /*
     *  1. player has access to the game
     *  2. game is not finished
     *  3. if it is multiplayer, the other player has joined
     *  4. move is in boundary
     *  5. move is available
     */

    if (!game.players.includes(playerId)) throw new ForbiddenException(ErrorMessages.access_denied);
    if (game.status === GameStatus.finished) throw new BadRequestException(ErrorMessages.games_is_finished);
    if (game.mode === GameMode.multi && (game.players[0] === '' || game.players[1] === '')) throw new BadRequestException(ErrorMessages.opponent_not_attended);
    if (+row === NaN || +col === NaN || +row > 3 || +col > 3 || +row < 1 || +col < 1) throw new BadRequestException(ErrorMessages.move_not_valid);

    const notAvailable = game.moves.some((_move) => {
      const { row: _row, col: _col } = JSON.parse(_move);
      if (_row === row && _col === col) return true;
    });
    if (notAvailable) throw new BadRequestException(ErrorMessages.move_not_avaiable);
  }

  _afterMove(game: Game): void {
    /*
     * is it draw or has winnner or next
     */

    const movesByPlayers = {
      [game.players[0]]: [],
      [game.players[1]]: []
    };
    let lastMove;

    game.moves.forEach((_move) => {
      const { row, col, playerId } = JSON.parse(_move);
      movesByPlayers[playerId].push(row + '' + col);
      lastMove = { row, col, playerId };
    });

    game.status = GameStatus.finished;
    game.next = '';
    if (this._isWinner(movesByPlayers[game.players[0]])) {
      game.winner = game.players[0];
    } else if (this._isWinner(movesByPlayers[game.players[1]])) {
      game.winner = game.players[1];
    } else if (game.moves.length === 9) {
      game.winner = 'draw';
    } else {
      game.status = GameStatus.pending;
      game.next = game.players[0] === lastMove.playerId ? game.players[1] : game.players[0];
    }
  }

  _isWinner(_moves: string[]): boolean {
    if (_moves.includes('22')) {
      if (_moves.includes('11') && _moves.includes('33')) return true;
      if (_moves.includes('13') && _moves.includes('31')) return true;
      if (_moves.includes('12') && _moves.includes('32')) return true;
      if (_moves.includes('21') && _moves.includes('23')) return true;
    } else if (_moves.includes('11')) {
      if (_moves.includes('12') && _moves.includes('13')) return true;
      if (_moves.includes('21') && _moves.includes('31')) return true;
    } else if (_moves.includes('33')) {
      if (_moves.includes('13') && _moves.includes('23')) return true;
      if (_moves.includes('31') && _moves.includes('32')) return true;
    }
    return false;
  }

  _availableMoves(game: Game): string[] {
    let availMoves = ['11', '12', '13', '21', '22', '23', '31', '32', '33'];
    game.moves.forEach((_move) => {
      const { row, col } = JSON.parse(_move);
      availMoves = availMoves.filter((move) => move !== row + '' + col);
    });
    return availMoves;
  }
}
