import { Test, TestingModule } from '@nestjs/testing';
import { SocieteService } from './societe.service';

describe('SocieteService', () => {
  let service: SocieteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocieteService],
    }).compile();

    service = module.get<SocieteService>(SocieteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
