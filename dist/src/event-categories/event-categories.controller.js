"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventCategoriesController = void 0;
const common_1 = require("@nestjs/common");
const event_categories_service_1 = require("./event-categories.service");
const create_event_category_dto_1 = require("./dto/create-event-category.dto");
const update_event_category_dto_1 = require("./dto/update-event-category.dto");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const role_guard_1 = require("../auth/guards/role.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let EventCategoriesController = class EventCategoriesController {
    eventCategoriesService;
    constructor(eventCategoriesService) {
        this.eventCategoriesService = eventCategoriesService;
    }
    async findAll() {
        return this.eventCategoriesService.findAll();
    }
    async findOne(id) {
        return this.eventCategoriesService.findOne(id);
    }
    async create(createEventCategoryDto) {
        return this.eventCategoriesService.create(createEventCategoryDto);
    }
    async update(id, updateEventCategoryDto) {
        return this.eventCategoriesService.update(id, updateEventCategoryDto);
    }
    async remove(id) {
        return this.eventCategoriesService.delete(id);
    }
};
exports.EventCategoriesController = EventCategoriesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.USER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventCategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.USER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventCategoriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.USER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_category_dto_1.CreateEventCategoryDto]),
    __metadata("design:returntype", Promise)
], EventCategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.USER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_event_category_dto_1.UpdateEventCategoryDto]),
    __metadata("design:returntype", Promise)
], EventCategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.USER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventCategoriesController.prototype, "remove", null);
exports.EventCategoriesController = EventCategoriesController = __decorate([
    (0, common_1.Controller)('event-categories'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, role_guard_1.RolesGuard),
    __metadata("design:paramtypes", [event_categories_service_1.EventCategoriesService])
], EventCategoriesController);
//# sourceMappingURL=event-categories.controller.js.map