import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Society, SocietySchema } from './entities/societe.entity';
import { SocietyController } from './societe.controller';
import { SocietyService } from './societe.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Society.name, schema: SocietySchema }]),
  ],
  controllers: [SocietyController],
  providers: [SocietyService],
})
export class SocieteModule {}
