export type SwaggerConfig = {
  info: {
    title: string;
    description: string;
    termsOfService: string;
    version: string;
  };
  serverDescription: string;
  tags: string[];
  url: string;
  port: number;
  path: string;
};
