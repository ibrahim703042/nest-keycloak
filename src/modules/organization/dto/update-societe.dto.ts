import { PartialType } from '@nestjs/swagger';
import { CreateBusinessDto } from './create-societe.dto';

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {}
