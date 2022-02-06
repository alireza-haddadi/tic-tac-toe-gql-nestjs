import { Inject } from '@nestjs/common';
import { Plugin } from '@nestjs/graphql';
import { ApolloServerPlugin, GraphQLRequestListener, GraphQLRequestContext } from 'apollo-server-plugin-base';
import { v4 as uuidv4 } from 'uuid';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  async requestDidStart(requestContext: GraphQLRequestContext): Promise<GraphQLRequestListener> {
    const request = requestContext.context.req;
    request.uuid = uuidv4();
    const method = request.method;
    const origin = request.headers['origin'];
    const userAgent = request.headers['user-agent'];

    this.logger.log('info', `${request.uuid} | ${method} ${origin} ${userAgent}`);

    const _logger = this.logger;
    return {
      async parsingDidStart(requestContext: GraphQLRequestContext) {
        return async (err) => {
          if (err) {
            _logger.log('error', `${requestContext.context.req.uuid} | ${JSON.stringify(err)}`);
          }
        };
      },
      async validationDidStart() {
        return async (errs) => {
          if (errs) {
            errs.forEach((err) => _logger.log('error', `${requestContext.context.req.uuid} | ${JSON.stringify(err)}`));
          }
        };
      },
      async executionDidStart() {
        return {
          async executionDidEnd(err) {
            if (err) {
              _logger.log('error', `${requestContext.context.req.uuid} | ${JSON.stringify(err)}`);
            }
          }
        };
      }
    };
  }
}
