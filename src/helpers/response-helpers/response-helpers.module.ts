import { Global, Module } from '@nestjs/common';
import { ResponseHelpersService } from './response-helpers.service';
@Global()
@Module({
  providers: [ResponseHelpersService],
  exports: [ResponseHelpersService],
})
export class ResponseHelpersModule {}
