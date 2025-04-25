// import { SwaggerConstants } from 'src/app.constants';
// import { getServerIp } from '../app.helper.service';
// import { SwaggerConfig } from './swagger.interface';

// const ipAddress = getServerIp();
// const swaggerPath = process.env.URL_PREFIX || 'default-path';
// const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4010;
// const swaggerUrl = `http://${ipAddress}:${port}/${swaggerPath}`;

// export const SWAGGER_CONFIG: SwaggerConfig = {
//   info: {
//     title: SwaggerConstants.title,
//     description: SwaggerConstants.description,
//     termsOfService: SwaggerConstants.termsOfService,
//     version: '1.0.0',
//   },
//   tags: [],
//   url: swaggerUrl,
//   port: port,
//   serverDescription: 'Local environment',
//   path: swaggerPath,
// };

// swagger.config.ts
import { SwaggerConstants } from 'src/app.constants';
import { getServerIp } from '../app.helper.service';
import { SwaggerConfig } from './swagger.interface';
import { ConfigService } from '@nestjs/config';

export const createSwaggerConfig = (
  configService: ConfigService,
): SwaggerConfig => {
  const ipAddress = getServerIp();
  const swaggerPath = configService.get('URL_PREFIX') || 'default-path';
  const port = configService.get<number>('PORT') || 4010;
  const swaggerUrl = `http://${ipAddress}:${port}/${swaggerPath}`;

  return {
    info: {
      title: SwaggerConstants.title,
      description: SwaggerConstants.description,
      termsOfService: SwaggerConstants.termsOfService,
      version: '1.0.0',
    },
    tags: [],
    url: swaggerUrl,
    port: port,
    serverDescription: 'Local environment',
    path: swaggerPath,
  };
};
