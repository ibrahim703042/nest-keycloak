import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ExternalModule } from './external.module';
import {
  PACKAGE_STORE_PACKAGE_NAME,
  STORE_SERVICE_NAME,
} from './proto/generated/store';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      // {
      //   name: 'ORDER_SERVICE_PACKAGE',
      //   transport: Transport.GRPC,
      //   options: {
      //     url: 'localhost:50052',
      //     package: 'order',
      //     protoPath: join(__dirname, 'proto/order.proto'),
      //   },
      // },
      {
        name: 'PRODUCT_SERVICE_PACKAGE',
        transport: Transport.GRPC,
        options: {
          url: 'localhost:50056',
          package: [
            // 'package.util',
            'package.tva',
            // 'package.tarification',
            // 'package.common',
            // 'package.category',
            // 'package.item',
          ],
          protoPath: [
            // join(__dirname, 'proto', 'shared/utils.proto'),
            join(__dirname, 'proto', 'vat.proto'),
            // join(__dirname, 'proto', 'tarification.proto'),
            // join(__dirname, 'proto', 'shared/common.proto'),
            // join(__dirname, 'proto', 'category.proto'),
            // join(__dirname, 'proto', 'item.proto'),
          ],
          loader: {
            includeDirs: [join(__dirname, 'proto')],
            longs: String,
            enums: String,
            bytes: String,
            objects: true,
            arrays: true,
            keepCase: true,
            defaults: true,
            oneofs: true,
          },
        },
      },
      {
        name: STORE_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: 'localhost:50061',
          package: [PACKAGE_STORE_PACKAGE_NAME],
          protoPath: [join(__dirname, 'proto', 'store.proto')],
          loader: {
            includeDirs: [join(__dirname, 'proto')],
            longs: String,
            enums: String,
            bytes: String,
            objects: true,
            arrays: true,
            keepCase: true,
            defaults: true,
            oneofs: true,
          },
        },
      },
    ]),
    ExternalModule,
  ],
  controllers: [],
  providers: [],
  exports: [ClientsModule],
})
export class GrpcClientsModule {}
