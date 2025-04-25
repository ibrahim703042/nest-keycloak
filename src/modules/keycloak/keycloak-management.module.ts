import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { GroupModule } from './group/group.module';
import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';

@Module({
  imports: [AuthModule, RoleModule, ClientModule, UserModule, GroupModule],

  controllers: [],
  providers: [],
})
export class KeycloakManagementModule {}
