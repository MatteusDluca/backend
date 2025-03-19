import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Res,
  HttpException,
  HttpStatus,
  Logger,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common'
import { Response } from 'express'
import { EmployeesService } from './employee.service'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { RolesGuard } from '../auth/guards/role.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role } from '@prisma/client'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  private readonly logger = new Logger(EmployeesController.name)

  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    try {
      this.logger.log(`Creating new employee: ${createEmployeeDto.email}`)
      return await this.employeesService.create(createEmployeeDto)
    } catch (error) {
      this.logger.error(
        `Error creating employee: ${error.message}`,
        error.stack,
      )
      throw error
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      this.logger.log(
        `Fetching employees with search: ${search}, page: ${page}, limit: ${limit}`,
      )
      return await this.employeesService.findAll({
        search,
        page: page ? parseInt(page.toString(), 10) : undefined,
        limit: limit ? parseInt(limit.toString(), 10) : undefined,
      })
    } catch (error) {
      this.logger.error(
        `Error fetching employees: ${error.message}`,
        error.stack,
      )
      throw new HttpException(
        'Error fetching employees',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    try {
      this.logger.log(`Fetching employee with ID: ${id}`)
      return await this.employeesService.findOne(id)
    } catch (error) {
      this.logger.error(
        `Error fetching employee ${id}: ${error.message}`,
        error.stack,
      )
      throw error
    }
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    try {
      this.logger.log(`Updating employee with ID: ${id}`)
      return await this.employeesService.update(id, updateEmployeeDto)
    } catch (error) {
      this.logger.error(
        `Error updating employee ${id}: ${error.message}`,
        error.stack,
      )
      throw error
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    try {
      this.logger.log(`Deleting employee with ID: ${id}`)
      return await this.employeesService.remove(id)
    } catch (error) {
      this.logger.error(
        `Error deleting employee ${id}: ${error.message}`,
        error.stack,
      )
      throw error
    }
  }

  @Get('pdf')
  @UseGuards(JwtAuthGuard)
  async generatePdf(@Res() res: Response) {
    try {
      this.logger.log('Generating PDF for all employees')
      const buffer = await this.employeesService.generatePdf()

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="employees.pdf"',
        'Content-Length': buffer.length,
      })

      res.end(buffer)
    } catch (error) {
      this.logger.error(
        `Error generating employees PDF: ${error.message}`,
        error.stack,
      )
      throw new HttpException(
        'Error generating PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get(':id/pdf')
  @UseGuards(JwtAuthGuard)
  async generateEmployeePdf(@Param('id') id: string, @Res() res: Response) {
    try {
      this.logger.log(`Generating PDF for employee ${id}`)
      const buffer = await this.employeesService.generateEmployeePdf(id)

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="employee-${id}.pdf"`,
        'Content-Length': buffer.length,
      })

      res.end(buffer)
    } catch (error) {
      this.logger.error(
        `Error generating PDF for employee ${id}: ${error.message}`,
        error.stack,
      )
      throw new HttpException(
        'Error generating PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Post(':id/upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo de imagem não fornecido')
    }

    return this.employeesService.uploadProfileImage(
      id,
      file.buffer,
      file.originalname,
    )
  }
}
