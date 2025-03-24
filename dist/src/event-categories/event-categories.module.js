"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventCategoriesModule = void 0;
const common_1 = require("@nestjs/common");
const event_categories_service_1 = require("./event-categories.service");
const event_categories_controller_1 = require("./event-categories.controller");
let EventCategoriesModule = class EventCategoriesModule {
};
exports.EventCategoriesModule = EventCategoriesModule;
exports.EventCategoriesModule = EventCategoriesModule = __decorate([
    (0, common_1.Module)({
        controllers: [event_categories_controller_1.EventCategoriesController],
        providers: [event_categories_service_1.EventCategoriesService],
        exports: [event_categories_service_1.EventCategoriesService],
    })
], EventCategoriesModule);
//# sourceMappingURL=event-categories.module.js.map