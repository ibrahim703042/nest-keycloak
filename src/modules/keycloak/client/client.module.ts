import { Global, Module } from '@nestjs/common';
import { ClientService } from './services/client.service';
import { ClientController } from './controllers/client.controller';
import { ClientRoleController } from './controllers/client-role.controller';
import { ClientRoleService } from './services/client-role.service';

@Global()
@Module({
  controllers: [ClientController, ClientRoleController],
  providers: [ClientService, ClientRoleService],
  exports: [ClientService, ClientRoleService],
})
export class ClientModule {}
