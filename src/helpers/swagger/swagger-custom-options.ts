/* eslint-disable @typescript-eslint/no-unused-vars */
import { INestApplication } from '@nestjs/common';
import { SwaggerConstants } from 'src/app.constants';

export function getCustomSwaggerOptions(app: INestApplication) {
  return {
    customSiteTitle: SwaggerConstants.customTitle,
    swaggerOptions: {
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
      defaultModelRendering: 'model',
      displayRequestDuration: true,
      filter: true,
      persistAuthorization: true,
      tryItOutEnabled: true,
      explore: true,
    },
  };
}
