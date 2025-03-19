/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'
import { UploadService } from '../upload/upload.service'
import * as bcrypt from 'bcrypt'
import * as PDFDocument from 'pdfkit'
import { Prisma } from '@prisma/client'

interface FindAllOptions {
  search?: string
  page?: number
  limit?: number
}

@Injectable()
export class EmployeesService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    // Verificar se já existe funcionário com o email ou CPF
    const existingEmployee = await this.prisma.employee.findFirst({
      where: {
        OR: [
          { email: createEmployeeDto.email },
          { cpf: createEmployeeDto.cpf },
          { phone: createEmployeeDto.phone },
        ],
      },
    })

    if (existingEmployee) {
      throw new ConflictException('E-mail, CPF ou telefone já cadastrado')
    }

    // Procurar ou criar estado
    const state = await this.prisma.state.upsert({
      where: { name: createEmployeeDto.state },
      update: {},
      create: {
        name: createEmployeeDto.state,
        uf: createEmployeeDto.state.substring(0, 2).toUpperCase(), // Simplificação
      },
    })

    // Procurar ou criar cidade
    const city = await this.prisma.city.upsert({
      where: {
        name_stateId: {
          name: createEmployeeDto.city,
          stateId: state.id,
        },
      },
      update: {},
      create: {
        name: createEmployeeDto.city,
        stateId: state.id,
      },
    })

    // Procurar ou criar rua
    const street = await this.prisma.street.upsert({
      where: { name: createEmployeeDto.street },
      update: {},
      create: {
        name: createEmployeeDto.street,
      },
    })

    // Criar endereço
    const address = await this.prisma.address.create({
      data: {
        number: createEmployeeDto.number,
        complement: createEmployeeDto.complement,
        zipCode: createEmployeeDto.zipCode,
        streetId: street.id,
        cityId: city.id,
      },
    })

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10)

    // Criar funcionário
    const employee = await this.prisma.employee.create({
      data: {
        name: createEmployeeDto.name,
        email: createEmployeeDto.email,
        cpf: createEmployeeDto.cpf,
        password: hashedPassword,
        salary: createEmployeeDto.salary,
        phone: createEmployeeDto.phone,
        birthday: createEmployeeDto.birthday || null,
        workHours: createEmployeeDto.workHours,
        role: createEmployeeDto.role || 'USER',
        imageUrl: createEmployeeDto.imageUrl,
        addressId: address.id,
      },
      include: {
        address: {
          include: {
            city: {
              include: {
                state: true,
              },
            },
            street: true,
          },
        },
      },
    })

    // Remover a senha do objeto retornado
    const { password, ...result } = employee

    return result
  }

  async findAll(options: FindAllOptions = {}) {
    const { search, page = 1, limit = 10 } = options
    const skip = (page - 1) * limit

    // Construir o filtro de pesquisa
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { cpf: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {}

    // Buscar os funcionários com paginação
    const employees = await this.prisma.employee.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        salary: true,
        phone: true,
        birthday: true,
        workHours: true,
        role: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        address: {
          include: {
            street: true,
            city: {
              include: {
                state: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    })

    // Contar o total de registros para a paginação
    const total = await this.prisma.employee.count({ where })

    return employees
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        salary: true,
        phone: true,
        birthday: true,
        workHours: true,
        role: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        address: {
          include: {
            street: true,
            city: {
              include: {
                state: true,
              },
            },
          },
        },
      },
    })

    if (!employee) {
      throw new NotFoundException(`Funcionário com ID ${id} não encontrado`)
    }

    return employee
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    // Verifica se o funcionário existe
    const existingEmployee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        address: true,
      },
    })

    if (!existingEmployee) {
      throw new NotFoundException(`Funcionário com ID ${id} não encontrado`)
    }

    // Verifica se o email, CPF ou telefone já estão em uso por outro funcionário
    const whereConditions: Prisma.EmployeeWhereInput[] = []

    if (updateEmployeeDto.email) {
      whereConditions.push({ email: updateEmployeeDto.email })
    }
    if (updateEmployeeDto.cpf) {
      whereConditions.push({ cpf: updateEmployeeDto.cpf })
    }
    if (updateEmployeeDto.phone) {
      whereConditions.push({ phone: updateEmployeeDto.phone })
    }

    if (whereConditions.length > 0) {
      const conflict = await this.prisma.employee.findFirst({
        where: {
          OR: whereConditions,
          NOT: {
            id,
          },
        },
      })

      if (conflict) {
        throw new ConflictException(
          'E-mail, CPF ou telefone já utilizado por outro funcionário',
        )
      }
    }

    // Atualiza os dados do endereço, se fornecidos
    if (
      updateEmployeeDto.street ||
      updateEmployeeDto.number ||
      updateEmployeeDto.complement ||
      updateEmployeeDto.zipCode ||
      updateEmployeeDto.city ||
      updateEmployeeDto.state
    ) {
      let streetId = existingEmployee.address?.streetId
      let cityId = existingEmployee.address?.cityId

      // Atualiza a rua, se fornecida
      if (updateEmployeeDto.street) {
        const street = await this.prisma.street.upsert({
          where: { name: updateEmployeeDto.street },
          update: {},
          create: {
            name: updateEmployeeDto.street,
          },
        })
        streetId = street.id
      }

      // Atualiza a cidade e estado, se fornecidos
      if (updateEmployeeDto.city || updateEmployeeDto.state) {
        if (
          updateEmployeeDto.city &&
          !updateEmployeeDto.state &&
          existingEmployee.address
        ) {
          const currentCity = await this.prisma.city.findUnique({
            where: { id: existingEmployee.address.cityId },
            include: { state: true },
          })

          if (currentCity && currentCity.state) {
            const state = await this.prisma.state.findUnique({
              where: { id: currentCity.stateId },
            })

            if (state) {
              const city = await this.prisma.city.upsert({
                where: {
                  name_stateId: {
                    name: updateEmployeeDto.city,
                    stateId: state.id,
                  },
                },
                update: {},
                create: {
                  name: updateEmployeeDto.city,
                  stateId: state.id,
                },
              })

              cityId = city.id
            }
          }
        } else if (updateEmployeeDto.city && updateEmployeeDto.state) {
          // Atualiza o estado
          const state = await this.prisma.state.upsert({
            where: { name: updateEmployeeDto.state },
            update: {},
            create: {
              name: updateEmployeeDto.state,
              uf: updateEmployeeDto.state.substring(0, 2).toUpperCase(),
            },
          })

          // Atualiza a cidade
          const city = await this.prisma.city.upsert({
            where: {
              name_stateId: {
                name: updateEmployeeDto.city,
                stateId: state.id,
              },
            },
            update: {},
            create: {
              name: updateEmployeeDto.city,
              stateId: state.id,
            },
          })

          cityId = city.id
        }
      }

      // Atualiza ou cria um novo endereço
      if (existingEmployee.addressId && existingEmployee.address) {
        await this.prisma.address.update({
          where: { id: existingEmployee.addressId },
          data: {
            number: updateEmployeeDto.number ?? existingEmployee.address.number,
            complement:
              updateEmployeeDto.complement ??
              existingEmployee.address.complement,
            zipCode:
              updateEmployeeDto.zipCode ?? existingEmployee.address.zipCode,
            streetId: streetId ?? existingEmployee.address.streetId,
            cityId: cityId ?? existingEmployee.address.cityId,
          },
        })
      } else if (streetId && cityId) {
        // Cria um novo endereço se o funcionário não tiver um
        const address = await this.prisma.address.create({
          data: {
            number: updateEmployeeDto.number!,
            complement: updateEmployeeDto.complement,
            zipCode: updateEmployeeDto.zipCode!,
            streetId,
            cityId,
          },
        })

        // Atualiza o endereço do funcionário
        await this.prisma.employee.update({
          where: { id },
          data: {
            addressId: address.id,
          },
        })
      }
    }

    // Atualiza os dados do funcionário
    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: {
        name: updateEmployeeDto.name,
        email: updateEmployeeDto.email,
        cpf: updateEmployeeDto.cpf,
        salary: updateEmployeeDto.salary,
        phone: updateEmployeeDto.phone,
        birthday: updateEmployeeDto.birthday,
        workHours: updateEmployeeDto.workHours,
        role: updateEmployeeDto.role,
        imageUrl: updateEmployeeDto.imageUrl,
      },
      include: {
        address: {
          include: {
            street: true,
            city: {
              include: {
                state: true,
              },
            },
          },
        },
      },
    })

    // Remove a senha do objeto retornado
    const { password, ...result } = updatedEmployee

    return result
  }

  async remove(id: string) {
    // Verifica se o funcionário existe
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        address: true,
      },
    })

    if (!employee) {
      throw new NotFoundException(`Funcionário com ID ${id} não encontrado`)
    }

    // Se existir uma imagem, deletá-la antes
    if (employee.imageUrl) {
      await this.uploadService.deleteFile(employee.imageUrl)
    }

    // Exclui o funcionário
    await this.prisma.employee.delete({
      where: { id },
    })

    // Exclui o endereço associado, se houver
    if (employee.addressId) {
      await this.prisma.address.delete({
        where: { id: employee.addressId },
      })
    }

    return { message: 'Funcionário excluído com sucesso' }
  }

  /**
   * Upload a profile image for an employee
   * @param id - Employee ID
   * @param imageBuffer - Image file buffer
   * @param filename - Original filename
   */
  async uploadProfileImage(
    id: string,
    imageBuffer: Buffer,
    filename: string,
  ): Promise<string> {
    // Check if employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    })

    if (!employee) {
      throw new NotFoundException(`Funcionário com ID ${id} não encontrado`)
    }

    // Delete old image if exists
    if (employee.imageUrl) {
      await this.uploadService.deleteFile(employee.imageUrl)
    }

    // Upload new image
    const imageUrl = await this.uploadService.uploadFile(imageBuffer, filename)

    // Update employee with new image URL
    await this.prisma.employee.update({
      where: { id },
      data: { imageUrl },
    })

    return imageUrl
  }

  async generatePdf(): Promise<Buffer> {
    // Busca todos os funcionários
    const employees = await this.prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        salary: true,
        phone: true,
        birthday: true,
        workHours: true,
        imageUrl: true,
        address: {
          include: {
            street: true,
            city: {
              include: {
                state: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    // Cria um novo documento PDF
    const doc = new PDFDocument({ margin: 50 })
    const buffers: Buffer[] = []

    doc.on('data', buffers.push.bind(buffers))

    // Adiciona o título
    doc.fontSize(25).text('Lista de Funcionários', { align: 'center' })
    doc.moveDown()

    // Adiciona a data de geração
    doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, {
      align: 'right',
    })
    doc.moveDown(2)

    // Define as colunas da tabela
    const tableTop = 150
    const tableLeft = 50

    // Cabeçalho da tabela
    doc.fontSize(12).font('Helvetica-Bold')
    doc.text('Nome', tableLeft, tableTop)
    doc.text('Email', tableLeft + 150, tableTop)
    doc.text('CPF', tableLeft + 300, tableTop)
    doc.text('Salário', tableLeft + 400, tableTop)

    // Linha horizontal após o cabeçalho
    doc
      .moveTo(tableLeft, tableTop + 20)
      .lineTo(tableLeft + 500, tableTop + 20)
      .stroke()

    // Dados da tabela
    let yPosition = tableTop + 30
    doc.font('Helvetica')

    employees.forEach((employee, index) => {
      // Verifica se é necessário adicionar uma nova página
      if (yPosition > 700) {
        doc.addPage()
        yPosition = 50

        // Repete o cabeçalho na nova página
        doc.fontSize(12).font('Helvetica-Bold')
        doc.text('Nome', tableLeft, yPosition)
        doc.text('Email', tableLeft + 150, yPosition)
        doc.text('CPF', tableLeft + 300, yPosition)
        doc.text('Salário', tableLeft + 400, yPosition)

        // Linha após o cabeçalho
        doc
          .moveTo(tableLeft, yPosition + 20)
          .lineTo(tableLeft + 500, yPosition + 20)
          .stroke()

        yPosition += 30
        doc.font('Helvetica')
      }

      // Formata o CPF
      const cpf = employee.cpf
      const formattedCpf = `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9)}`

      // Formata o salário
      const formattedSalary = `R$ ${employee.salary.toFixed(2).replace('.', ',')}`

      // Adiciona os dados
      doc.text(employee.name, tableLeft, yPosition, { width: 140 })
      doc.text(employee.email, tableLeft + 150, yPosition, { width: 140 })
      doc.text(formattedCpf, tableLeft + 300, yPosition)
      doc.text(formattedSalary, tableLeft + 400, yPosition)

      // Linha entre os registros
      if (index < employees.length - 1) {
        doc
          .moveTo(tableLeft, yPosition + 20)
          .lineTo(tableLeft + 500, yPosition + 20)
          .stroke()
      }

      yPosition += 30
    })

    // Finaliza o documento
    doc.end()

    // Converte o documento para buffer
    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers))
      })
    })
  }

  async generateEmployeePdf(id: string): Promise<Buffer> {
    // Busca o funcionário
    const employee = await this.findOne(id)

    if (!employee) {
      throw new NotFoundException(`Funcionário com ID ${id} não encontrado`)
    }

    // Cria um novo documento PDF
    const doc = new PDFDocument({ margin: 50 })
    const buffers: Buffer[] = []

    doc.on('data', buffers.push.bind(buffers))

    // Adiciona o título
    doc
      .fontSize(25)
      .text(`Ficha do Funcionário: ${employee.name}`, { align: 'center' })
    doc.moveDown()

    // Adiciona a data de geração
    doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, {
      align: 'right',
    })
    doc.moveDown(2)

    // Informações pessoais
    doc.fontSize(16).font('Helvetica-Bold').text('Informações Pessoais')
    doc.moveDown(0.5)
    doc.font('Helvetica')

    // Formata o CPF
    const cpf = employee.cpf
    const formattedCpf = `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9)}`

    // Formata o salário
    const formattedSalary = `R$ ${employee.salary.toFixed(2).replace('.', ',')}`

    // Formata a data
    const formatDate = (dateString?: string) => {
      if (!dateString) return 'Não informado'
      return new Date(dateString).toLocaleDateString('pt-BR')
    }

    // Dados pessoais
    doc.fontSize(12)
    doc.text(`Nome: ${employee.name}`)
    doc.moveDown(0.5)
    doc.text(`Email: ${employee.email}`)
    doc.moveDown(0.5)
    doc.text(`CPF: ${formattedCpf}`)
    doc.moveDown(0.5)
    doc.text(`Telefone: ${employee.phone}`)
    doc.moveDown(0.5)
    doc.text(
      `Data de Nascimento: ${employee.birthday ? formatDate(employee.birthday) : 'Não informado'}`,
    )
    doc.moveDown(0.5)
    doc.text(`Horário de Trabalho: ${employee.workHours}`)
    doc.moveDown(0.5)
    doc.text(`Salário: ${formattedSalary}`)
    doc.moveDown(0.5)
    doc.text(
      `Função: ${employee.role === 'ADMIN' ? 'Administrador' : 'Usuário'}`,
    )
    doc.moveDown(0.5)

    // Linha horizontal
    doc
      .moveTo(50, doc.y + 20)
      .lineTo(550, doc.y + 20)
      .stroke()

    doc.moveDown(2)

    // Informações de endereço
    if (employee.address) {
      doc.fontSize(16).font('Helvetica-Bold').text('Endereço')
      doc.moveDown(0.5)
      doc.font('Helvetica').fontSize(12)

      doc.text(
        `Rua: ${employee.address.street.name}, ${employee.address.number}`,
      )
      doc.moveDown(0.5)

      if (employee.address.complement) {
        doc.text(`Complemento: ${employee.address.complement}`)
        doc.moveDown(0.5)
      }

      doc.text(`CEP: ${employee.address.zipCode}`)
      doc.moveDown(0.5)
      doc.text(`Cidade: ${employee.address.city.name}`)
      doc.moveDown(0.5)
      doc.text(
        `Estado: ${employee.address.city.state.name} (${employee.address.city.state.uf})`,
      )
    }

    // Finaliza o documento
    doc.end()

    // Converte o documento para buffer
    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers))
      })
    })
  }
}
