import { Test, TestingModule } from '@nestjs/testing';
import { SocieteController } from './societe.controller';
import { SocieteService } from './societe.service';

describe('SocieteController', () => {
  let controller: SocieteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocieteController],
      providers: [SocieteService],
    }).compile();

    controller = module.get<SocieteController>(SocieteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
