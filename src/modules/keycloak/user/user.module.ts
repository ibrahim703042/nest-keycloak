import { Global, Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { GroupUserMappingService } from './services/group-user-mapping.service';
import { UserService } from './services/user.service';
import { GroupUserMappingController } from './controllers/group-user-mapping.controller';

@Global()
@Module({
  imports: [],
  controllers: [UserController, GroupUserMappingController],
  providers: [UserService, GroupUserMappingService],
  exports: [UserService, GroupUserMappingService],
})
export class UserModule {}
