import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { GamesResolver } from './games.resolver';
import { GamesService } from './games.service';

@Module({
  imports: [StorageModule],
  providers: [GamesService, GamesResolver],
})
export class GamesModule {}
