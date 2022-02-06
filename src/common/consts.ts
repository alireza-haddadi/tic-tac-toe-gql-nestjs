export enum GameMode {
  single = 'SINGLE',
  multi = 'MULTI'
}

export enum GameStatus {
  pending = 'PENDING',
  finished = 'FINISHED'
}

export enum ErrorMessages {
  unvalid_token = "Token is not valid!",
  title_is_taken = "Title is taken!",
  game_not_found = "Game not found!",
  already_joined = "Already joined!",
  not_able_to_join = "Not able to join!",
  access_denied = "Access denied!",
  games_is_finished = "Game is finished!",
  opponent_not_attended = "Opponent not attended!",
  move_not_valid = "Move is not valid!",
  move_not_avaiable = "Move is not available!",
  username_not_available = "Username is not available!",
}