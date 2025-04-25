import { Global, Module } from '@nestjs/common';
import { FiscalYear, FiscalYearSchema } from './entities/fiscal-year.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { FiscalYearController } from './fiscal-year.controller';
import { FiscalYearService } from './fiscal-year.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FiscalYear.name, schema: FiscalYearSchema },
    ]),
  ],
  controllers: [FiscalYearController],
  providers: [FiscalYearService],
  exports: [FiscalYearService],
})
export class FiscalYearModule {}
