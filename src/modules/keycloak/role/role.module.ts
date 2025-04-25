import { Global, Module } from '@nestjs/common';
import { RealmRoleService } from './services/realm-role.service';
import { UserRoleMappingService } from './services/user-role-mapping.service';
import { RealmRoleController } from './controllers/realm-role.controller';
import { UserRoleMappingController } from './controllers/user-role-mapping.controller';

@Global()
@Module({
  imports: [],
  controllers: [RealmRoleController, UserRoleMappingController],
  providers: [RealmRoleService, UserRoleMappingService],
  exports: [RealmRoleService, UserRoleMappingService],
})
export class RoleModule {}
