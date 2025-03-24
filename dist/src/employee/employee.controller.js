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
var EmployeesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesController = void 0;
const common_1 = require("@nestjs/common");
const employee_service_1 = require("./employee.service");
const create_employee_dto_1 = require("./dto/create-employee.dto");
const update_employee_dto_1 = require("./dto/update-employee.dto");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const role_guard_1 = require("../auth/guards/role.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const platform_express_1 = require("@nestjs/platform-express");
let EmployeesController = EmployeesController_1 = class EmployeesController {
    employeesService;
    logger = new common_1.Logger(EmployeesController_1.name);
    constructor(employeesService) {
        this.employeesService = employeesService;
    }
    async create(createEmployeeDto) {
        try {
            this.logger.log(`Creating new employee: ${createEmployeeDto.email}`);
            return await this.employeesService.create(createEmployeeDto);
        }
        catch (error) {
            this.logger.error(`Error creating employee: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findAll(search, page, limit) {
        try {
            this.logger.log(`Fetching employees with search: ${search}, page: ${page}, limit: ${limit}`);
            return await this.employeesService.findAll({
                search,
                page: page ? parseInt(page.toString(), 10) : undefined,
                limit: limit ? parseInt(limit.toString(), 10) : undefined,
            });
        }
        catch (error) {
            this.logger.error(`Error fetching employees: ${error.message}`, error.stack);
            throw new common_1.HttpException('Error fetching employees', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            this.logger.log(`Fetching employee with ID: ${id}`);
            return await this.employeesService.findOne(id);
        }
        catch (error) {
            this.logger.error(`Error fetching employee ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async update(id, updateEmployeeDto) {
        try {
            this.logger.log(`Updating employee with ID: ${id}`);
            return await this.employeesService.update(id, updateEmployeeDto);
        }
        catch (error) {
            this.logger.error(`Error updating employee ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async remove(id) {
        try {
            this.logger.log(`Deleting employee with ID: ${id}`);
            return await this.employeesService.remove(id);
        }
        catch (error) {
            this.logger.error(`Error deleting employee ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async generatePdf(res) {
        try {
            this.logger.log('Generating PDF for all employees');
            const buffer = await this.employeesService.generatePdf();
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="employees.pdf"',
                'Content-Length': buffer.length,
            });
            res.end(buffer);
        }
        catch (error) {
            this.logger.error(`Error generating employees PDF: ${error.message}`, error.stack);
            throw new common_1.HttpException('Error generating PDF', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateEmployeePdf(id, res) {
        try {
            this.logger.log(`Generating PDF for employee ${id}`);
            const buffer = await this.employeesService.generateEmployeePdf(id);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="employee-${id}.pdf"`,
                'Content-Length': buffer.length,
            });
            res.end(buffer);
        }
        catch (error) {
            this.logger.error(`Error generating PDF for employee ${id}: ${error.message}`, error.stack);
            throw new common_1.HttpException('Error generating PDF', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async uploadProfileImage(id, file) {
        if (!file) {
            throw new common_1.BadRequestException('Arquivo de imagem não fornecido');
        }
        return this.employeesService.uploadProfileImage(id, file.buffer, file.originalname);
    }
};
exports.EmployeesController = EmployeesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_employee_dto_1.CreateEmployeeDto]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_employee_dto_1.UpdateEmployeeDto]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('pdf'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "generatePdf", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "generateEmployeePdf", null);
__decorate([
    (0, common_1.Post)(':id/upload-image'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "uploadProfileImage", null);
exports.EmployeesController = EmployeesController = EmployeesController_1 = __decorate([
    (0, common_1.Controller)('employees'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, role_guard_1.RolesGuard),
    __metadata("design:paramtypes", [employee_service_1.EmployeesService])
], EmployeesController);
//# sourceMappingURL=employee.controller.js.map