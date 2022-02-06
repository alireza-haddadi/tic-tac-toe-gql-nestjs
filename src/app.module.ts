import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as Joi from 'joi';
import { LoggingPlugin } from './common/plugins/logging.plugin';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    GamesModule,
    GraphQLModule.forRoot({
      playground: true,
      installSubscriptionHandlers: true,
      autoSchemaFile: 'schema.gql'
    }),
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required()
      })
    }),
    WinstonModule.forRoot({
      level: 'info',
      format: winston.format.simple(),
      transports: [
        new winston.transports.File({ filename: 'gql-request-log.log' , level: 'info'}),
        new winston.transports.File({ filename: 'gql-error-log.log' , level: 'error'})
      ],
    })
  ],
  providers: [Logger, LoggingPlugin]
})
export class AppModule {}
