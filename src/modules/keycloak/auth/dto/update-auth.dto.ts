import { PartialType } from '@nestjs/swagger';
import { LoginDto } from './create-auth.dto';

export class UpdateLoginDto extends PartialType(LoginDto) {}
