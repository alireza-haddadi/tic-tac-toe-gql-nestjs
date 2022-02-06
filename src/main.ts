import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { altairExpress } from 'altair-express-middleware';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.use(
    '/altair',
    altairExpress({
      endpointURL: '/graphql',
      subscriptionsEndpoint: `ws://localhost:3000/graphql`,
      initialQuery: `subscription {
      opponentMove(gameId: "838dc064-c528-4391-a0df-b2d7adb6493b") {
        row
        col
        playerId
      }\n}`
    })
  );

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
