"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const employee_module_1 = require("./employee/employee.module");
const upload_service_1 = require("./upload/upload.service");
const upload_module_1 = require("./upload/upload.module");
const clients_service_1 = require("./clients/clients.service");
const clients_controller_1 = require("./clients/clients.controller");
const clients_module_1 = require("./clients/clients.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const categories_service_1 = require("./categories/categories.service");
const categories_controller_1 = require("./categories/categories.controller");
const categories_module_1 = require("./categories/categories.module");
const products_module_1 = require("./products/products.module");
const event_categories_module_1 = require("./event-categories/event-categories.module");
const locations_module_1 = require("./locations/locations.module");
const events_module_1 = require("./events/events.module");
const contract_module_1 = require("./contract/contract.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            employee_module_1.EmployeesModule,
            upload_module_1.UploadModule,
            clients_module_1.ClientsModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
            categories_module_1.CategoriesModule,
            products_module_1.ProductsModule,
            products_module_1.ProductsModule,
            event_categories_module_1.EventCategoriesModule,
            events_module_1.EventsModule,
            locations_module_1.LocationsModule,
            contract_module_1.ContractsModule,
        ],
        providers: [upload_service_1.UploadService, clients_service_1.ClientsService, categories_service_1.CategoriesService],
        controllers: [clients_controller_1.ClientsController, categories_controller_1.CategoriesController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map