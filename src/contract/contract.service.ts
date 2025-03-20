// src/contracts/contracts.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
  import { CreateContractDto } from './dto/create-contract.dto';
  import { UpdateContractDto } from './dto/update-contract.dto';
  import { FilterContractsDto } from './dto/filter-contracts.dto';
  import * as PDFDocument from 'pdfkit';
  import { join } from 'path';
  import * as fs from 'fs';
  import * as path from 'path';
  import * as mammoth from 'mammoth';
  
  // Definir enums localmente para evitar problemas de importação do Prisma
  export enum ContractStatus {
    ACTIVE = 'ACTIVE',
    CANCELED = 'CANCELED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
  }
  
  export enum PaymentMethod {
    PIX = 'PIX',
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    CASH = 'CASH',
  }
  
  export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED = 'FIXED',
  }
  
  @Injectable()
  export class ContractsService {
    constructor(private prisma: PrismaService) {}
  
    /**
     * Cria um novo contrato de aluguel
     */
    async create(createContractDto: CreateContractDto) {
      // Verificar se o cliente existe
      const client = await this.prisma.client.findUnique({
        where: { id: createContractDto.clientId },
      });
  
      if (!client) {
        throw new NotFoundException(
          `Cliente com ID ${createContractDto.clientId} não encontrado`,
        );
      }
  
      // Verificar se o evento existe, se fornecido
      if (createContractDto.eventId) {
        const event = await this.prisma.event.findUnique({
          where: { id: createContractDto.eventId },
        });
        if (!event) {
          throw new NotFoundException(
            `Evento com ID ${createContractDto.eventId} não encontrado`,
          );
        }
      }
  
      // Verificar se o local existe, se fornecido
      if (createContractDto.locationId) {
        const location = await this.prisma.location.findUnique({
          where: { id: createContractDto.locationId },
        });
        if (!location) {
          throw new NotFoundException(
            `Local com ID ${createContractDto.locationId} não encontrado`,
          );
        }
      }
  
      // Verificar se os produtos existem e estão disponíveis
      const productIds = createContractDto.items.map((item) => item.productId);
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
      });
  
      if (products.length !== productIds.length) {
        throw new NotFoundException(
          'Um ou mais produtos não foram encontrados',
        );
      }
  
      const unavailableProducts = products.filter(
        (p) => p.status !== 'AVAILABLE' && p.status !== 'RENTED',
      );
  
      if (unavailableProducts.length > 0) {
        throw new BadRequestException(
          `Os seguintes produtos não estão disponíveis para aluguel: ${unavailableProducts
            .map((p) => p.name)
            .join(', ')}`,
        );
      }
  
      // Verificar se há quantidade suficiente de cada produto
      const insufficientProducts: string[] = [];
      for (const item of createContractDto.items) {
        const product = products.find((p) => p.id === item.productId);
        if (product && product.quantity < item.quantity) {
          insufficientProducts.push(product.name);
        }
      }
  
      if (insufficientProducts.length > 0) {
        throw new BadRequestException(
          `Quantidade insuficiente para os produtos: ${insufficientProducts.join(
            ', ',
          )}`,
        );
      }
  
      // Validar datas (data de retirada deve ser anterior à data de devolução)
      const pickupDate = new Date(createContractDto.pickupDate);
      const returnDate = new Date(createContractDto.returnDate);
  
      if (returnDate <= pickupDate) {
        throw new BadRequestException(
          'A data de devolução deve ser posterior à data de retirada',
        );
      }
  
      // Se fittingDate for fornecido, deve ser anterior ou igual à data de retirada
      if (createContractDto.fittingDate) {
        const fittingDate = new Date(createContractDto.fittingDate);
        if (fittingDate > pickupDate) {
          throw new BadRequestException(
            'A data da prova deve ser anterior ou igual à data de retirada',
          );
        }
      }
  
      // Cálculo dos valores de pagamento e validação
      for (const payment of createContractDto.payments) {
        if (payment.discountType && payment.discountValue) {
          let calculatedFinalValue;
          
          if (payment.discountType === DiscountType.PERCENTAGE) {
            if (payment.discountValue < 0 || payment.discountValue > 100) {
              throw new BadRequestException(
                'O valor do desconto percentual deve estar entre 0 e 100',
              );
            }
            calculatedFinalValue = payment.totalValue * (1 - payment.discountValue / 100);
          } else {
            if (payment.discountValue > payment.totalValue) {
              throw new BadRequestException(
                'O valor do desconto não pode ser maior que o valor total',
              );
            }
            calculatedFinalValue = payment.totalValue - payment.discountValue;
          }
  
          // Verificar se o valor final fornecido está correto (com uma margem de erro para arredondamentos)
          const difference = Math.abs(calculatedFinalValue - payment.finalValue);
          if (difference > 0.01) {
            throw new BadRequestException(
              'O valor final do pagamento não corresponde ao cálculo do desconto aplicado',
            );
          }
        } else if (!payment.discountType && !payment.discountValue) {
          // Se não houver desconto, o valor final deve ser igual ao valor total
          if (payment.totalValue !== payment.finalValue) {
            throw new BadRequestException(
              'Sem desconto aplicado, o valor final deve ser igual ao valor total',
            );
          }
        } else {
          throw new BadRequestException(
            'Tipo de desconto e valor de desconto devem ser ambos fornecidos ou ambos omitidos',
          );
        }
      }
  
      // Criar o contrato com seus itens e pagamentos em uma única transação
      try {
        return await this.prisma.$transaction(async (tx) => {
          // Criamos o contrato primeiro
          const contractData = {
            clientId: createContractDto.clientId,
            eventId: createContractDto.eventId,
            locationId: createContractDto.locationId,
            status: createContractDto.status || ContractStatus.ACTIVE,
            fittingDate: createContractDto.fittingDate ? new Date(createContractDto.fittingDate) : null,
            pickupDate: new Date(createContractDto.pickupDate),
            returnDate: new Date(createContractDto.returnDate),
            needsAdjustment: createContractDto.needsAdjustment || false,
            observations: createContractDto.observations,
          };
  
          // @ts-ignore - Ignoramos o erro de tipagem porque sabemos que o modelo existe
          const contract = await tx.contract.create({
            data: contractData,
          });
  
          // Adicionamos os itens do contrato
          for (const item of createContractDto.items) {
            // @ts-ignore
            await tx.contractItem.create({
              data: {
                contractId: contract.id,
                productId: item.productId,
                quantity: item.quantity,
                unitValue: item.unitValue,
              },
            });
  
            // Atualizar o status do produto para RENTED
            await tx.product.update({
              where: { id: item.productId },
              data: { status: 'RENTED' },
            });
          }
  
          // Adicionamos os pagamentos
          for (const payment of createContractDto.payments) {
            // @ts-ignore
            await tx.payment.create({
              data: {
                contractId: contract.id,
                method: payment.method,
                totalValue: payment.totalValue,
                discountType: payment.discountType,
                discountValue: payment.discountValue,
                finalValue: payment.finalValue,
                notes: payment.notes,
              },
            });
          }
  
          // Retornamos o contrato com todas as relações carregadas
          // @ts-ignore
          return await tx.contract.findUnique({
            where: { id: contract.id },
            include: {
              client: true,
              event: true,
              location: true,
              // @ts-ignore
              items: {
                include: {
                  product: true,
                },
              },
              // @ts-ignore
              payments: true,
            },
          });
        });
      } catch (error) {
        // Tratamento genérico de erro
        if (error.code === 'P2025') {
          throw new NotFoundException('Recurso não encontrado');
        }
        throw error;
      }
    }
  
    /**
     * Busca todos os contratos com filtros opcionais
     */
    async findAll(filters: FilterContractsDto) {
      // Construir o objeto de filtro para o Prisma
      const where: any = {};
  
      // Filtro por status
      if (filters.status && filters.status.length > 0) {
        where.status = { in: filters.status };
      }
  
      // Filtro por data de criação
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        
        if (filters.startDate) {
          where.createdAt.gte = new Date(filters.startDate);
        }
        
        if (filters.endDate) {
          where.createdAt.lte = new Date(filters.endDate);
        }
      }
  
      // Filtro por cliente
      if (filters.clientId) {
        where.clientId = filters.clientId;
      }
  
      // Filtro por evento
      if (filters.eventId) {
        where.eventId = filters.eventId;
      }
  
      // Filtro por termo de busca (nome do cliente, código do produto, etc.)
      if (filters.search) {
        where.OR = [
          {
            client: {
              name: {
                contains: filters.search,
                mode: 'insensitive',
              },
            },
          },
          {
            // @ts-ignore - Sabemos que essa relação existe mesmo que o TypeScript não reconheça
            items: {
              some: {
                product: {
                  name: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
          {
            // @ts-ignore
            items: {
              some: {
                product: {
                  code: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
          {
            event: {
              name: {
                contains: filters.search,
                mode: 'insensitive',
              },
            },
          },
          {
            location: {
              name: {
                contains: filters.search,
                mode: 'insensitive',
              },
            },
          },
        ];
      }
  
      // @ts-ignore - Ignoramos o erro de tipagem porque sabemos que o modelo existe
      return await this.prisma.contract.findMany({
        where,
        include: {
          client: true,
          event: true,
          location: true,
          // @ts-ignore
          items: {
            include: {
              product: true,
            },
          },
          // @ts-ignore
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }
  
    /**
     * Busca um contrato específico pelo ID
     */
    async findOne(id: string) {
      // @ts-ignore - Ignoramos o erro de tipagem porque sabemos que o modelo existe
      const contract = await this.prisma.contract.findUnique({
        where: { id },
        include: {
          client: {
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
              measurements: true,
            },
          },
          event: true,
          location: true,
          // @ts-ignore
          items: {
            include: {
              product: true,
            },
          },
          // @ts-ignore
          payments: true,
        },
      });
  
      if (!contract) {
        throw new NotFoundException(`Contrato com ID ${id} não encontrado`);
      }
  
      return contract;
    }
  
    /**
     * Atualiza um contrato existente
     */
    async update(id: string, updateContractDto: UpdateContractDto) {
      // Verificar se o contrato existe
      await this.findOne(id);
  
      // Verificar cliente, evento e localização, se fornecidos
      if (updateContractDto.clientId) {
        const client = await this.prisma.client.findUnique({
          where: { id: updateContractDto.clientId },
        });
        if (!client) {
          throw new NotFoundException(
            `Cliente com ID ${updateContractDto.clientId} não encontrado`,
          );
        }
      }
  
      if (updateContractDto.eventId) {
        const event = await this.prisma.event.findUnique({
          where: { id: updateContractDto.eventId },
        });
        if (!event) {
          throw new NotFoundException(
            `Evento com ID ${updateContractDto.eventId} não encontrado`,
          );
        }
      }
  
      if (updateContractDto.locationId) {
        const location = await this.prisma.location.findUnique({
          where: { id: updateContractDto.locationId },
        });
        if (!location) {
          throw new NotFoundException(
            `Local com ID ${updateContractDto.locationId} não encontrado`,
          );
        }
      }
  
      // Validar datas, se fornecidas
      let pickupDate, returnDate, fittingDate;
  
      // Obter o contrato atual para usar valores existentes quando necessário
      // @ts-ignore
      const currentContract = await this.prisma.contract.findUnique({
        where: { id },
        select: {
          pickupDate: true,
          returnDate: true,
          fittingDate: true,
        },
      });
  
      if (!currentContract) {
        throw new NotFoundException(`Contrato com ID ${id} não encontrado`);
      }
  
      if (updateContractDto.pickupDate) {
        pickupDate = new Date(updateContractDto.pickupDate);
      } else {
        pickupDate = currentContract.pickupDate;
      }
  
      if (updateContractDto.returnDate) {
        returnDate = new Date(updateContractDto.returnDate);
      } else {
        returnDate = currentContract.returnDate;
      }
  
      if (returnDate <= pickupDate) {
        throw new BadRequestException(
          'A data de devolução deve ser posterior à data de retirada',
        );
      }
  
      if (updateContractDto.fittingDate) {
        fittingDate = new Date(updateContractDto.fittingDate);
        if (fittingDate > pickupDate) {
          throw new BadRequestException(
            'A data da prova deve ser anterior ou igual à data de retirada',
          );
        }
      }
  
      try {
        return await this.prisma.$transaction(async (tx) => {
          // Atualizar o contrato principal
          const contractData: any = {
            clientId: updateContractDto.clientId,
            eventId: updateContractDto.eventId,
            locationId: updateContractDto.locationId,
            status: updateContractDto.status,
            fittingDate: updateContractDto.fittingDate ? new Date(updateContractDto.fittingDate) : undefined,
            pickupDate: updateContractDto.pickupDate ? new Date(updateContractDto.pickupDate) : undefined,
            returnDate: updateContractDto.returnDate ? new Date(updateContractDto.returnDate) : undefined,
            needsAdjustment: updateContractDto.needsAdjustment,
            observations: updateContractDto.observations,
          };
  
          // Remover propriedades indefinidas
          Object.keys(contractData).forEach(
            (key) => contractData[key] === undefined && delete contractData[key],
          );
  
          // @ts-ignore
          let updatedContract = await tx.contract.update({
            where: { id },
            data: contractData,
          });
  
          // Se houver itens a serem atualizados
          if (updateContractDto.items && updateContractDto.items.length > 0) {
            // Primeiro, obter os itens atuais
            // @ts-ignore
            const currentItems = await tx.contractItem.findMany({
              where: { contractId: id },
            });
  
            // Excluir todos os itens atuais
            // @ts-ignore
            await tx.contractItem.deleteMany({
              where: { contractId: id },
            });
  
            // Restaurar o status dos produtos para AVAILABLE
            for (const item of currentItems) {
              await tx.product.update({
                where: { id: item.productId },
                data: { status: 'AVAILABLE' },
              });
            }
  
            // Verificar produtos e quantidades para os novos itens
            const productIds = updateContractDto.items.map((item) => item.productId);
            const products = await tx.product.findMany({
              where: { id: { in: productIds } },
            });
  
            if (products.length !== productIds.length) {
              throw new NotFoundException(
                'Um ou mais produtos não foram encontrados',
              );
            }
  
            // Criar novos itens
            for (const item of updateContractDto.items) {
              // @ts-ignore
              await tx.contractItem.create({
                data: {
                  contractId: id,
                  productId: item.productId,
                  quantity: item.quantity,
                  unitValue: item.unitValue,
                },
              });
  
              // Atualizar status do produto para RENTED
              await tx.product.update({
                where: { id: item.productId },
                data: { status: 'RENTED' },
              });
            }
          }
  
          // Se houver pagamentos a serem atualizados
          if (updateContractDto.payments && updateContractDto.payments.length > 0) {
            // Excluir todos os pagamentos atuais
            // @ts-ignore
            await tx.payment.deleteMany({
              where: { contractId: id },
            });
  
            // Criar novos pagamentos
            for (const payment of updateContractDto.payments) {
              // @ts-ignore
              await tx.payment.create({
                data: {
                  contractId: id,
                  method: payment.method,
                  totalValue: payment.totalValue,
                  discountType: payment.discountType,
                  discountValue: payment.discountValue,
                  finalValue: payment.finalValue,
                  notes: payment.notes,
                },
              });
            }
          }
  
          // Buscar o contrato atualizado com todas as relações
          // @ts-ignore
          updatedContract = await tx.contract.findUnique({
            where: { id },
            include: {
              client: true,
              event: true,
              location: true,
              // @ts-ignore
              items: {
                include: {
                  product: true,
                },
              },
              // @ts-ignore
              payments: true,
            },
          });
  
          return updatedContract;
        });
      } catch (error) {
        // Tratamento genérico de erro
        if (error.code === 'P2025') {
          throw new NotFoundException('Recurso não encontrado');
        }
        throw error;
      }
    }
  
    /**
     * Remove um contrato existente
     */
    async remove(id: string) {
      // Verificar se o contrato existe
      const contract = await this.findOne(id);
  
      try {
        return await this.prisma.$transaction(async (tx) => {
          // Obter os itens do contrato para restaurar o status dos produtos
          // @ts-ignore
          const contractItems = await tx.contractItem.findMany({
            where: { contractId: id },
          });
  
          // Restaurar o status dos produtos para AVAILABLE
          for (const item of contractItems) {
            await tx.product.update({
              where: { id: item.productId },
              data: { status: 'AVAILABLE' },
            });
          }
  
          // Excluir o contrato (isso também excluirá itens e pagamentos devido ao onDelete: Cascade)
          // @ts-ignore
          await tx.contract.delete({
            where: { id },
          });
  
          return { message: 'Contrato excluído com sucesso' };
        });
      } catch (error) {
        // Tratamento genérico de erro
        if (error.code === 'P2025') {
          throw new NotFoundException(`Contrato com ID ${id} não encontrado`);
        }
        throw error;
      }
    }
  
    /**
     * Gera um PDF com a lista de todos os contratos
     * CORREÇÃO: Este método foi modificado para retornar diretamente a URL do arquivo
     * em vez de uma Promise, para compatibilidade com a API
     */
    async generateContractsPdf() {
      // @ts-ignore
      const contracts = await this.prisma.contract.findMany({
        include: {
          client: true,
          event: true,
          // @ts-ignore
          items: { 
            include: { 
              product: true 
            } 
          },
          // @ts-ignore
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      });
  
      // Nome do arquivo de saída
      const fileName = `contratos_${Date.now()}.pdf`;
      const filePath = join(process.cwd(), 'uploads', fileName);
      
      // Criar diretório de uploads se não existir
      const uploadDir = join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }
  
      // Criar um novo documento PDF
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);
  
      // Título
      doc.fontSize(20).text('Lista de Contratos', { align: 'center' });
      doc.moveDown();
  
      // Data de geração
      doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, {
        align: 'right',
      });
      doc.moveDown(2);
  
      // Sumário dos contratos por status
      const statusCounts = {
        ACTIVE: contracts.filter(c => c.status === 'ACTIVE').length,
        CANCELED: contracts.filter(c => c.status === 'CANCELED').length,
        IN_PROGRESS: contracts.filter(c => c.status === 'IN_PROGRESS').length,
        COMPLETED: contracts.filter(c => c.status === 'COMPLETED').length,
      };
  
      doc.fontSize(12).font('Helvetica-Bold').text('Resumo por Status:');
      doc.moveDown(0.5);
      doc.font('Helvetica');
      doc.text(`Ativos: ${statusCounts.ACTIVE}`);
      doc.text(`Cancelados: ${statusCounts.CANCELED}`);
      doc.text(`Em Andamento: ${statusCounts.IN_PROGRESS}`);
      doc.text(`Concluídos: ${statusCounts.COMPLETED}`);
      doc.moveDown(1);
  
      // Tabela de contratos - posicionamento ajustado
    doc.fontSize(12).font('Helvetica-Bold');
    const colPositions = [50, 150, 280, 360, 440, 520]; // Posições ajustadas das colunas
    doc.text('ID', colPositions[0], 200);
    doc.text('Cliente', colPositions[1], 200);
    doc.text('Status', colPositions[2], 200);
    doc.text('Retirada', colPositions[3], 200);
    doc.text('Devolução', colPositions[4], 200);
    doc.text('Total', colPositions[5], 200);

    // Linha separadora
    doc.moveTo(50, 220).lineTo(570, 220).stroke();
    doc.font('Helvetica');
  
      let yPosition = 230;
  
      // Função para traduzir o status
      const translateStatus = (status: string) => {
        const statusMap = {
          ACTIVE: 'Ativo',
          CANCELED: 'Cancelado',
          IN_PROGRESS: 'Em Andamento',
          COMPLETED: 'Concluído',
        };
        return statusMap[status] || status;
      };
  
      // Listar contratos
      for (const contract of contracts) {
        // Verificar se precisamos de uma nova página
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
          
          // Repetir o cabeçalho
          doc.fontSize(12).font('Helvetica-Bold');
          doc.text('ID', 50, yPosition);
          doc.text('Cliente', 100, yPosition);
          doc.text('Status', 250, yPosition);
          doc.text('Retirada', 320, yPosition);
          doc.text('Devolução', 400, yPosition);
          doc.text('Total', 480, yPosition);
          
          // Linha separadora
          doc.moveTo(50, yPosition + 20).lineTo(550, yPosition + 20).stroke();
          doc.font('Helvetica');
          
          yPosition += 30;
        }
  
        // Calcular valor total do contrato
        const totalValue = contract.payments.reduce(
          (sum, payment) => sum + payment.finalValue, 
          0
        );
  
        // ID truncado
        const shortId = contract.id.substring(0, 6);
        
        // Formatação de datas
        const formatDate = (date: Date) => {
          return date.toLocaleDateString('pt-BR');
        };
  
        // Adicionar linha do contrato
        doc.text(shortId, colPositions[0], yPosition);
        doc.text(contract.client.name.substring(0, 20), colPositions[1], yPosition);
        doc.text(translateStatus(contract.status), colPositions[2], yPosition);
        doc.text(formatDate(contract.pickupDate), colPositions[3], yPosition);
        doc.text(formatDate(contract.returnDate), colPositions[4], yPosition);
        doc.text(`R$ ${totalValue.toFixed(2)}`, colPositions[5], yPosition);
  
        // Mover para a próxima linha
        yPosition += 30;
      }
  
      // Finalizar o documento
      doc.end();
  
      // Retornar a URL do arquivo após finalizar a escrita
      return new Promise<string>((resolve, reject) => {
        writeStream.on('finish', () => {
          const fileUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${fileName}`;
          resolve(fileUrl);
        });
        writeStream.on('error', reject);
      });
    }
  
    /**
     * Gera um PDF detalhado para um contrato específico
     */
    async generateContractPdf(id: string) {
      const contract = await this.findOne(id);
      
      // Nome do arquivo de saída
      const fileName = `contrato_${contract.id}_${Date.now()}.pdf`;
      const filePath = join(process.cwd(), 'uploads', fileName);
      
      // Criar diretório de uploads se não existir
      const uploadDir = join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }
  
      // Criar um novo documento PDF
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);
  
      // Título
      doc.fontSize(20).text('CONTRATO DE ALUGUEL', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Contrato Nº: ${contract.id}`, { align: 'center' });
      doc.moveDown(2);
  
      // Data de geração
      doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, {
        align: 'right',
      });
      doc.moveDown(2);
  
      // Função para traduzir o status
      const translateStatus = (status: string) => {
        const statusMap = {
          ACTIVE: 'Ativo',
          CANCELED: 'Cancelado',
          IN_PROGRESS: 'Em Andamento',
          COMPLETED: 'Concluído',
        };
        return statusMap[status] || status;
      };
  
      // Função para formatar datas
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR');
      };
  
      // Informações do cliente
      doc.fontSize(14).font('Helvetica-Bold').text('DADOS DO CLIENTE:');
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica');
      doc.text(`Nome: ${contract.client.name}`);
      doc.text(`CPF/CNPJ: ${contract.client.cpfCnpj}`);
      doc.text(`Email: ${contract.client.email}`);
      doc.text(`Telefone: ${contract.client.phone}`);
      
      // Endereço do cliente
      if (contract.client.address) {
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica-Bold').text('Endereço:');
        doc.fontSize(12).font('Helvetica');
        const { address } = contract.client;
        doc.text(`${address.street.name}, ${address.number}${address.complement ? `, ${address.complement}` : ''}`);
        doc.text(`${address.city.name} - ${address.city.state.uf}, CEP: ${address.zipCode}`);
      }
      
      doc.moveDown(1.5);
  
      // Informações do evento, se houver
      if (contract.event) {
        doc.fontSize(14).font('Helvetica-Bold').text('DADOS DO EVENTO:');
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica');
        doc.text(`Nome do Evento: ${contract.event.name}`);
        
        if (contract.event.date) {
          doc.text(`Data: ${contract.event.date}`);
        }
        
        if (contract.event.time) {
          doc.text(`Hora: ${contract.event.time}`);
        }
        
        doc.moveDown(1.5);
      }
  
      // Informações do local, se houver
      if (contract.location) {
        doc.fontSize(14).font('Helvetica-Bold').text('LOCAL:');
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica');
        doc.text(`Nome do Local: ${contract.location.name}`);
        
        // Buscar o endereço explicitamente se existir um addressId
        if (contract.location.addressId) {
          const locationAddress = await this.prisma.address.findUnique({
            where: { id: contract.location.addressId },
            include: {
              street: true,
              city: {
                include: {
                  state: true,
                },
              },
            },
          });
          
          if (locationAddress) {
            doc.text(`Endereço: ${locationAddress.street.name}, ${locationAddress.number}${locationAddress.complement ? `, ${locationAddress.complement}` : ''}`);
            doc.text(`${locationAddress.city.name} - ${locationAddress.city.state.uf}, CEP: ${locationAddress.zipCode}`);
          }
        }
        
        doc.moveDown(1.5);
      }
  
      // Datas do contrato
      doc.fontSize(14).font('Helvetica-Bold').text('DATAS:');
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica');
      
      if (contract.fittingDate) {
        doc.text(`Data da Prova: ${formatDate(contract.fittingDate)}`);
      }
      
      doc.text(`Data de Retirada: ${formatDate(contract.pickupDate)}`);
      doc.text(`Data de Devolução: ${formatDate(contract.returnDate)}`);
      doc.text(`Necessita de Ajustes: ${contract.needsAdjustment ? 'Sim' : 'Não'}`);
      doc.moveDown(1.5);
      
      // Status do contrato
      doc.fontSize(14).font('Helvetica-Bold').text(`STATUS: ${translateStatus(contract.status)}`);
      doc.moveDown(1.5);
  
      // Itens do contrato
      doc.fontSize(14).font('Helvetica-Bold').text('ITENS:');
      doc.moveDown(0.5);
      
      // Tabela de itens
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Produto', 50, doc.y);
      doc.text('Código', 200, doc.y - 12);
      doc.text('Qtd', 280, doc.y - 12);
      doc.text('Valor Unit.', 320, doc.y - 12);
      doc.text('Total', 400, doc.y - 12);
      
      // Linha separadora
      const itemsHeaderY = doc.y;
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      
      // Lista de itens
      doc.font('Helvetica');
      let itemsTotal = 0;
      
      for (const item of contract.items) {
        // Verificar se precisamos de uma nova página
        if (doc.y > 700) {
          doc.addPage();
          doc.fontSize(12).font('Helvetica-Bold');
          doc.text('Produto', 50, 50);
          doc.text('Código', 200, 50);
          doc.text('Qtd', 280, 50);
          doc.text('Valor Unit.', 320, 50);
          doc.text('Total', 400, 50);
          
          // Linha separadora
          doc.moveTo(50, 70).lineTo(550, 70).stroke();
          doc.font('Helvetica');
          doc.y = 80;
        }
        
        const lineItemTotal = item.quantity * item.unitValue;
        itemsTotal += lineItemTotal;
        
        const startY = doc.y + 10;
        doc.text(item.product.name, 50, startY);
        doc.text(item.product.code, 200, startY);
        doc.text(item.quantity.toString(), 280, startY);
        doc.text(`R$ ${item.unitValue.toFixed(2)}`, 320, startY);
        doc.text(`R$ ${lineItemTotal.toFixed(2)}`, 400, startY);
        
        doc.y = startY + 15;
      }
      
      // Linha separadora
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      
      // Total de itens
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Total de Itens: R$ ${itemsTotal.toFixed(2)}`, { align: 'right' });
      doc.moveDown(1.5);
  
      // Pagamentos
      doc.fontSize(14).font('Helvetica-Bold').text('PAGAMENTOS:');
      doc.moveDown(0.5);
      
      // Função para traduzir método de pagamento
      const translatePaymentMethod = (method: string) => {
        const methodMap = {
          PIX: 'PIX',
          CREDIT_CARD: 'Cartão de Crédito',
          DEBIT_CARD: 'Cartão de Débito',
          CASH: 'Dinheiro',
        };
        return methodMap[method] || method;
      };
      
      // Tabela de pagamentos
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Método', 50, doc.y);
      doc.text('Valor Total', 180, doc.y - 12);
      doc.text('Desconto', 280, doc.y - 12);
      doc.text('Valor Final', 400, doc.y - 12);
      
      // Linha separadora
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      
      // Lista de pagamentos
      doc.font('Helvetica');
      let paymentsTotal = 0;
      
      for (const payment of contract.payments) {
        // Verificar se precisamos de uma nova página
        if (doc.y > 700) {
          doc.addPage();
          doc.fontSize(12).font('Helvetica-Bold');
          doc.text('Método', 50, 50);
          doc.text('Valor Total', 180, 50);
          doc.text('Desconto', 280, 50);
          doc.text('Valor Final', 400, 50);
          
          // Linha separadora
          doc.moveTo(50, 70).lineTo(550, 70).stroke();
          doc.font('Helvetica');
          doc.y = 80;
        }
        
        paymentsTotal += payment.finalValue;
        
        const startY = doc.y + 10;
        doc.text(translatePaymentMethod(payment.method), 50, startY);
        doc.text(`R$ ${payment.totalValue.toFixed(2)}`, 180, startY);
        
        let discountText = 'Nenhum';
        if (payment.discountType && payment.discountValue) {
          if (payment.discountType === 'PERCENTAGE') {
            discountText = `${payment.discountValue}%`;
          } else {
            discountText = `R$ ${payment.discountValue.toFixed(2)}`;
          }
        }
        
        doc.text(discountText, 280, startY);
        doc.text(`R$ ${payment.finalValue.toFixed(2)}`, 400, startY);
        
        doc.y = startY + 15;
      }
      
      // Linha separadora
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      
      // Total de pagamentos
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Total de Pagamentos: R$ ${paymentsTotal.toFixed(2)}`, { align: 'right' });
      doc.moveDown(1.5);
  
      // Observações
      if (contract.observations) {
        doc.fontSize(14).font('Helvetica-Bold').text('OBSERVAÇÕES:');
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica');
        doc.text(contract.observations);
        doc.moveDown(1.5);
      }
  
      // Assinaturas
      doc.y = Math.max(doc.y, 650);  // Garantir espaço para assinaturas
      
      doc.fontSize(12).font('Helvetica');
      doc.text('_________________________________', { align: 'left', width: 200 });
      doc.text('Assinatura do Cliente', { align: 'left', width: 200 });
      doc.moveUp(2);
      
      doc.text('_________________________________', { align: 'right', width: 200 });
      doc.text('Assinatura da Empresa', { align: 'right', width: 200 });
  
      // Finalizar o documento
      doc.end();
  
      // Aguardar a finalização da escrita
      return new Promise<string>((resolve, reject) => {
        writeStream.on('finish', () => {
          const fileUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${fileName}`;
          resolve(fileUrl);
        });
        writeStream.on('error', reject);
      });
    }
  
    /**
     * Processa um modelo de contrato em DOCX e substitui variáveis
     */
    async processContractTemplate(id: string, templateBuffer: Buffer) {
      const contract = await this.findOne(id);
      
      // Extrair o conteúdo HTML do arquivo DOCX usando mammoth
      const result = await mammoth.convertToHtml({ buffer: templateBuffer });
      let htmlContent = result.value;
      
      // Substituição de variáveis no template
      // Cliente
      htmlContent = htmlContent.replace(/\{\{cliente\.nome\}\}/g, contract.client.name || '');
      htmlContent = htmlContent.replace(/\{\{cliente\.cpf_cnpj\}\}/g, contract.client.cpfCnpj || '');
      htmlContent = htmlContent.replace(/\{\{cliente\.email\}\}/g, contract.client.email || '');
      htmlContent = htmlContent.replace(/\{\{cliente\.telefone\}\}/g, contract.client.phone || '');
      
      // Endereço do cliente
      if (contract.client.address) {
        const address = contract.client.address;
        htmlContent = htmlContent.replace(/\{\{cliente\.endereco\.rua\}\}/g, address.street.name || '');
        htmlContent = htmlContent.replace(/\{\{cliente\.endereco\.numero\}\}/g, address.number || '');
        htmlContent = htmlContent.replace(/\{\{cliente\.endereco\.complemento\}\}/g, address.complement || '');
        htmlContent = htmlContent.replace(/\{\{cliente\.endereco\.cep\}\}/g, address.zipCode || '');
        htmlContent = htmlContent.replace(/\{\{cliente\.endereco\.cidade\}\}/g, address.city.name || '');
        htmlContent = htmlContent.replace(/\{\{cliente\.endereco\.estado\}\}/g, address.city.state.name || '');
        htmlContent = htmlContent.replace(/\{\{cliente\.endereco\.uf\}\}/g, address.city.state.uf || '');
      }
      
      // Contrato
      htmlContent = htmlContent.replace(/\{\{contrato\.id\}\}/g, contract.id || '');
      htmlContent = htmlContent.replace(/\{\{contrato\.data_criacao\}\}/g, contract.createdAt.toLocaleDateString('pt-BR') || '');
      
      // Datas
      if (contract.fittingDate) {
        htmlContent = htmlContent.replace(/\{\{contrato\.data_prova\}\}/g, contract.fittingDate.toLocaleDateString('pt-BR') || '');
      }
      htmlContent = htmlContent.replace(/\{\{contrato\.data_retirada\}\}/g, contract.pickupDate.toLocaleDateString('pt-BR') || '');
      htmlContent = htmlContent.replace(/\{\{contrato\.data_devolucao\}\}/g, contract.returnDate.toLocaleDateString('pt-BR') || '');
      htmlContent = htmlContent.replace(/\{\{contrato\.necessita_ajustes\}\}/g, contract.needsAdjustment ? 'Sim' : 'Não');
      
      // Status
      const statusMap = {
        ACTIVE: 'Ativo',
        CANCELED: 'Cancelado',
        IN_PROGRESS: 'Em Andamento',
        COMPLETED: 'Concluído',
      };
      htmlContent = htmlContent.replace(/\{\{contrato\.status\}\}/g, statusMap[contract.status] || contract.status);
      
      // Evento
      if (contract.event) {
        htmlContent = htmlContent.replace(/\{\{evento\.nome\}\}/g, contract.event.name || '');
        htmlContent = htmlContent.replace(/\{\{evento\.data\}\}/g, contract.event.date || '');
        htmlContent = htmlContent.replace(/\{\{evento\.hora\}\}/g, contract.event.time || '');
      }
      
      // Local
      if (contract.location) {
        htmlContent = htmlContent.replace(/\{\{local\.nome\}\}/g, contract.location.name || '');
        
        // Buscar o endereço explicitamente se existir um addressId
        if (contract.location.addressId) {
          const locationAddress = await this.prisma.address.findUnique({
            where: { id: contract.location.addressId },
            include: {
              street: true,
              city: {
                include: {
                  state: true,
                },
              },
            },
          });
          
          if (locationAddress) {
            htmlContent = htmlContent.replace(/\{\{local\.endereco\.rua\}\}/g, locationAddress.street.name || '');
            htmlContent = htmlContent.replace(/\{\{local\.endereco\.numero\}\}/g, locationAddress.number || '');
            htmlContent = htmlContent.replace(/\{\{local\.endereco\.complemento\}\}/g, locationAddress.complement || '');
            htmlContent = htmlContent.replace(/\{\{local\.endereco\.cep\}\}/g, locationAddress.zipCode || '');
            htmlContent = htmlContent.replace(/\{\{local\.endereco\.cidade\}\}/g, locationAddress.city.name || '');
            htmlContent = htmlContent.replace(/\{\{local\.endereco\.estado\}\}/g, locationAddress.city.state.name || '');
            htmlContent = htmlContent.replace(/\{\{local\.endereco\.uf\}\}/g, locationAddress.city.state.uf || '');
          }
        }
      }
      
      // Observações
      htmlContent = htmlContent.replace(/\{\{contrato\.observacoes\}\}/g, contract.observations || '');
      
      // Itens do contrato
      let itemsTable = '<table border="1" cellpadding="5" style="width:100%"><tr><th>Produto</th><th>Código</th><th>Quantidade</th><th>Valor Unitário</th><th>Total</th></tr>';
      let itemsTotal = 0;
      
      for (const item of contract.items) {
        const itemTotal = item.quantity * item.unitValue;
        itemsTotal += itemTotal;
        
        itemsTable += `
          <tr>
            <td>${item.product.name}</td>
            <td>${item.product.code}</td>
            <td>${item.quantity}</td>
            <td>R$ ${item.unitValue.toFixed(2)}</td>
            <td>R$ ${itemTotal.toFixed(2)}</td>
          </tr>
        `;
      }
      
      itemsTable += `
        <tr>
          <td colspan="4" align="right"><strong>Total:</strong></td>
          <td><strong>R$ ${itemsTotal.toFixed(2)}</strong></td>
        </tr>
      </table>`;
      
      htmlContent = htmlContent.replace(/\{\{contrato\.itens\}\}/g, itemsTable);
      
      // Pagamentos
      let paymentsTable = '<table border="1" cellpadding="5" style="width:100%"><tr><th>Método</th><th>Valor Total</th><th>Desconto</th><th>Valor Final</th></tr>';
      let paymentsTotal = 0;
      
      const methodMap = {
        PIX: 'PIX',
        CREDIT_CARD: 'Cartão de Crédito',
        DEBIT_CARD: 'Cartão de Débito',
        CASH: 'Dinheiro',
      };
      
      for (const payment of contract.payments) {
        paymentsTotal += payment.finalValue;
        
        let discountText = 'Nenhum';
        if (payment.discountType && payment.discountValue) {
          if (payment.discountType === 'PERCENTAGE') {
            discountText = `${payment.discountValue}%`;
          } else {
            discountText = `R$ ${payment.discountValue.toFixed(2)}`;
          }
        }
        
        paymentsTable += `
          <tr>
            <td>${methodMap[payment.method] || payment.method}</td>
            <td>R$ ${payment.totalValue.toFixed(2)}</td>
            <td>${discountText}</td>
            <td>R$ ${payment.finalValue.toFixed(2)}</td>
          </tr>
        `;
      }
      
      paymentsTable += `
        <tr>
          <td colspan="3" align="right"><strong>Total:</strong></td>
          <td><strong>R$ ${paymentsTotal.toFixed(2)}</strong></td>
        </tr>
      </table>`;
      
      htmlContent = htmlContent.replace(/\{\{contrato\.pagamentos\}\}/g, paymentsTable);
      
      // Converter HTML para PDF
      const fileName = `contrato_${contract.id}_modelo_${Date.now()}.pdf`;
      const filePath = join(process.cwd(), 'uploads', fileName);
      
      // Criar diretório de uploads se não existir
      const uploadDir = join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }
      
      // Usar PDFKit para gerar o PDF
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);
      
      // Não há uma maneira direta de renderizar HTML com PDFKit, então vamos fazer uma solução simplificada
      // Usamos mammoth para extrair o texto e substituir as variáveis, mas perdemos alguma formatação
      
      // Converter de volta para texto simples
      const textContent = htmlContent
        .replace(/<table[^>]*>/g, '\n\n')
        .replace(/<\/table>/g, '\n\n')
        .replace(/<tr[^>]*>/g, '')
        .replace(/<\/tr>/g, '\n')
        .replace(/<td[^>]*>/g, ' ')
        .replace(/<\/td>/g, ' | ')
        .replace(/<th[^>]*>/g, ' ')
        .replace(/<\/th>/g, ' | ')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\|\s*\|/g, '|')
        .replace(/\|\s*\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n');
      
      // Adicionar conteúdo ao PDF
      doc.fontSize(12).text(textContent, {
        paragraphGap: 10,
        lineGap: 5,
        align: 'justify',
      });
      
      // Finalizar o documento
      doc.end();
      
      // Aguardar a finalização da escrita
      return new Promise<string>((resolve, reject) => {
        writeStream.on('finish', () => {
          const fileUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${fileName}`;
          resolve(fileUrl);
        });
        writeStream.on('error', reject);
      });
    }
  }