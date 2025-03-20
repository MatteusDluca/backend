/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common'
import { ContractsService } from './contract.service'
import { CreateContractDto } from './dto/create-contract.dto'
import { UpdateContractDto } from './dto/update-contract.dto'
import { FilterContractsDto } from './dto/filter-contracts.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { RolesGuard } from '../auth/guards/role.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role } from '@prisma/client'

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractController {
  constructor(private readonly contractsService: ContractsService) {}

  // IMPORTANTE: Rotas específicas devem vir ANTES das rotas parametrizadas (:id)
  // Rota para gerar PDF de todos os contratos
  @Get('pdf-all')
  @Roles(Role.ADMIN, Role.USER)
  async generateAllPdf() {
    return this.contractsService.generateContractsPdf()
  }

  // Rotas alternativas para compatibilidade com diferentes implementações do frontend
  @Get('all-pdf')
  @Roles(Role.ADMIN, Role.USER)
  async generateAllPdfAlt() {
    return this.contractsService.generateContractsPdf()
  }

  @Post()
  @Roles(Role.ADMIN, Role.USER)
  async create(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto)
  }

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  async findAll(@Query() filters: FilterContractsDto) {
    return this.contractsService.findAll(filters)
  }

  // Rotas com parâmetro :id devem vir DEPOIS das rotas específicas
  @Get(':id/pdf')
  @Roles(Role.ADMIN, Role.USER)
  async generatePdf(@Param('id') id: string) {
    return this.contractsService.generateContractPdf(id)
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  async findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id)
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.USER)
  async update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractsService.update(id, updateContractDto)
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.USER)
  async remove(@Param('id') id: string) {
    return this.contractsService.remove(id)
  }
}
