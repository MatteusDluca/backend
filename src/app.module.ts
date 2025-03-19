// src/app.module.ts
import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { EmployeesModule } from './employee/employee.module'
import { UploadService } from './upload/upload.service'
import { UploadModule } from './upload/upload.module'
import { ClientsService } from './clients/clients.service'
import { ClientsController } from './clients/clients.controller'
import { ClientsModule } from './clients/clients.module'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { CategoriesService } from './categories/categories.service'
import { CategoriesController } from './categories/categories.controller'
import { CategoriesModule } from './categories/categories.module'

import { ProductsModule } from './products/products.module'
import { EventCategoriesModule } from './event-categories/event-categories.module'

import { LocationsModule } from './locations/locations.module'
import { EventsModule } from './events/events.module'
import { ContractsModule } from './contract/contract.module'

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EmployeesModule,
    UploadModule,
    ClientsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    CategoriesModule,
    ProductsModule,
    ProductsModule,
    EventCategoriesModule,
    EventsModule,
    LocationsModule,
    ContractsModule,
  ],
  providers: [UploadService, ClientsService, CategoriesService],
  controllers: [ClientsController, CategoriesController],
})
export class AppModule {}
