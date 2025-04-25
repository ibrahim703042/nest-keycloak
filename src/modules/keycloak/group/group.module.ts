import { Global, Module } from '@nestjs/common';
import { GroupService } from './services/group.service';
import { GroupRoleMappingService } from './services/group-role-mapping.service';
import { GroupController } from './controllers/group.controller';
import { GroupRoleMappingController } from './controllers/group-client-role-assignements.controller';
import { ClientRoleGroupService } from './services/client-role-group.service';

@Global()
@Module({
  controllers: [GroupController, GroupRoleMappingController],
  providers: [GroupService, GroupRoleMappingService, ClientRoleGroupService],
  exports: [GroupService, GroupRoleMappingService, ClientRoleGroupService],
})
export class GroupModule {}
