import { INestApplication, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { createSwaggerConfig } from './swagger.config';
import { getCustomSwaggerOptions } from './swagger-custom-options';

export function swaggerConfiguration(app: INestApplication) {
  const logger = new Logger('SwaggerSetup');

  const configService = app.get(ConfigService);
  const SWAGGER_CONFIG = createSwaggerConfig(configService);

  try {
    const builder = new DocumentBuilder()
      .setTitle(SWAGGER_CONFIG.info.title)
      .setDescription(SWAGGER_CONFIG.info.description)
      .setVersion(SWAGGER_CONFIG.info.version)
      .setTermsOfService(SWAGGER_CONFIG.info.termsOfService ?? '')
      .addServer(SWAGGER_CONFIG.url, SWAGGER_CONFIG.serverDescription)
      .addServer(
        configService.get('SERVER_URL_PRODUCTION') || 'http://localhost:3000',
        'Production environment',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'authorization',
      )
      .addApiKey(
        {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
        'x-api-key',
      )
      .addGlobalParameters({
        name: 'tenantId',
        in: 'header',
        required: false,
        description: 'Tenant ID for multi-tenant applications',
        schema: {
          type: 'string',
        },
      });

    const options = builder.build();
    const document = SwaggerModule.createDocument(app, options);
    const customOptions = getCustomSwaggerOptions(app);

    SwaggerModule.setup(SWAGGER_CONFIG.path, app, document, customOptions);

    logger.log(`📚 Swagger UI available at ${SWAGGER_CONFIG.url}`);
  } catch (error) {
    logger.error('Failed to set up Swagger documentation', error);
  }
}
