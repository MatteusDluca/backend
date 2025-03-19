// src/products/products.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { UploadService } from '../upload/upload.service'
import { Product, ProductStatus } from '@prisma/client'
import * as PDFDocument from 'pdfkit'
import { CategoriesService } from '../categories/categories.service'
import { join } from 'path'
import * as fs from 'fs'

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private categoriesService: CategoriesService,
  ) {}

  /**
   * Cria um novo produto
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Verifica se já existe um produto com o mesmo código
    const existingProduct = await this.prisma.product.findUnique({
      where: { code: createProductDto.code },
    })

    if (existingProduct) {
      throw new ConflictException('Já existe um produto com este código')
    }

    // Prepara os dados para criação, garantindo que categoryId seja tratado adequadamente
    const productData = { ...createProductDto }

    // Se categoryId estiver presente e não estiver vazio, verifica se a categoria existe
    if (productData.categoryId) {
      try {
        await this.categoriesService.findOne(productData.categoryId)
      } catch (error) {
        // Se a categoria não for encontrada, remove o categoryId para evitar erro de chave estrangeira
        if (error instanceof NotFoundException) {
          delete productData.categoryId
        } else {
          throw error
        }
      }
    } else {
      // Se categoryId for vazio ou null, remova-o para evitar erro de FK
      delete productData.categoryId
    }

    // Cria o produto com os dados tratados
    return this.prisma.product.create({
      data: productData,
    })
  }

  /**
   * Retorna todos os produtos
   */
  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({
      include: {
        category: true, // Incluir a relação
      },
      orderBy: { name: 'asc' },
    })
  }

  /**
   * Busca um produto pelo ID
   */
  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true, // Incluir a relação
      },
    })

    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`)
    }

    return product
  }

  /**
   * Atualiza um produto
   */
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    // Verifica se o produto existe
    await this.findOne(id)

    // Verifica se está tentando atualizar para um código que já existe
    if (updateProductDto.code) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { code: updateProductDto.code },
      })

      if (existingProduct && existingProduct.id !== id) {
        throw new ConflictException('Já existe um produto com este código')
      }
    }

    // Se um categoryId for fornecido, verifica se a categoria existe
    if (updateProductDto.categoryId) {
      await this.categoriesService.findOne(updateProductDto.categoryId)
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true, // Incluir a relação
      },
    })
  }

  /**
   * Remove um produto
   */
  async remove(id: string): Promise<void> {
    const product = await this.findOne(id)

    // Se o produto tem uma imagem, remove-a primeiro
    if (product.imageUrl) {
      await this.uploadService.deleteFile(product.imageUrl)
    }

    await this.prisma.product.delete({
      where: { id },
    })
  }

  /**
   * Atualiza a imagem de um produto
   */
  async updateImage(
    id: string,
    imageBuffer: Buffer,
    fileName: string,
  ): Promise<Product> {
    // Verifica se o produto existe
    const product = await this.findOne(id)

    // Se já existe uma imagem, exclua-a primeiro
    if (product.imageUrl) {
      await this.uploadService.deleteFile(product.imageUrl)
    }

    // Faz upload da nova imagem
    const imageUrl = await this.uploadService.uploadFile(imageBuffer, fileName)

    // Atualiza o produto com a nova URL da imagem
    return this.prisma.product.update({
      where: { id },
      data: { imageUrl },
    })
  }

  /**
   * Gera um PDF com a lista de todos os produtos
   */
  async generateProductsPdf(): Promise<string> {
    const products = await this.findAll()
    const doc = new PDFDocument({ margin: 50 })

    // Nome do arquivo de saída
    const fileName = `produtos_${Date.now()}.pdf`
    const filePath = join(process.cwd(), 'uploads', fileName)

    // Pipe do PDF para um arquivo
    const writeStream = fs.createWriteStream(filePath)
    doc.pipe(writeStream)

    // Título
    doc.fontSize(20).text('Lista de Produtos', { align: 'center' })
    doc.moveDown()

    // Data de geração
    doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, {
      align: 'right',
    })
    doc.moveDown(2)

    // Tabela de produtos
    const tableTop = 150
    const tableLeft = 50
    const columnWidth = 100

    // Cabeçalho da tabela
    doc.fontSize(12).font('Helvetica-Bold')
    doc.text('Código', tableLeft, tableTop)
    doc.text('Nome', tableLeft + columnWidth, tableTop)
    doc.text('Status', tableLeft + columnWidth * 2, tableTop)
    doc.text('Valor', tableLeft + columnWidth * 3, tableTop)
    doc.moveDown()

    // Conteúdo da tabela
    let currentPosition = tableTop + 20
    doc.fontSize(10).font('Helvetica')

    for (const product of products) {
      // Se a página estiver cheia, adicione uma nova página
      if (currentPosition > 700) {
        doc.addPage()
        currentPosition = 50
      }

      doc.text(product.code, tableLeft, currentPosition)
      doc.text(product.name, tableLeft + columnWidth, currentPosition)
      doc.text(
        this.translateStatus(product.status),
        tableLeft + columnWidth * 2,
        currentPosition,
      )
      doc.text(
        `R$ ${product.rentalValue.toFixed(2)}`,
        tableLeft + columnWidth * 3,
        currentPosition,
      )

      currentPosition += 20
    }

    // Rodapé
    doc
      .fontSize(10)
      .text(`Total de produtos: ${products.length}`, { align: 'right' })

    // Finaliza o PDF
    doc.end()

    // Aguarda a conclusão da gravação
    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        const fileUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${fileName}`
        resolve(fileUrl)
      })

      writeStream.on('error', reject)
    })
  }

  /**
   * Gera um PDF com os detalhes de um produto específico
   */
  /**
   * Gera um PDF com os detalhes de um produto específico
   */
  async generateProductPdf(id: string): Promise<string> {
    // Use diretamente o método findOne que já foi modificado para incluir category
    const product = await this.findOne(id)
    const doc = new PDFDocument({ margin: 50 })

    // Nome do arquivo de saída
    const fileName = `produto_${product.code}_${Date.now()}.pdf`
    const filePath = join(process.cwd(), 'uploads', fileName)
    // Pipe do PDF para um arquivo
    const writeStream = fs.createWriteStream(filePath)
    doc.pipe(writeStream)

    // Título
    doc
      .fontSize(20)
      .text(`Detalhes do Produto: ${product.name}`, { align: 'center' })
    doc.moveDown()

    // Data de geração
    doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, {
      align: 'right',
    })
    doc.moveDown(2)

    // Adiciona imagem do produto se existir
    if (product.imageUrl) {
      try {
        const imagePath = product.imageUrl.replace(
          `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/`,
          '',
        )
        const fullImagePath = join(process.cwd(), 'uploads', imagePath)

        if (fs.existsSync(fullImagePath)) {
          doc.image(fullImagePath, {
            fit: [250, 250],
            align: 'center',
          })
          doc.moveDown(2)
        }
      } catch (error) {
        console.error('Erro ao carregar imagem do produto:', error)
      }
    }

    // Informações do produto
    doc.fontSize(12)
    doc.text(`Código: ${product.code}`)
    doc.moveDown()
    doc.text(`Status: ${this.translateStatus(product.status)}`)
    doc.moveDown()
    doc.text(`Tamanho: ${product.size}`)
    doc.moveDown()
    doc.text(`Quantidade: ${product.quantity}`)
    doc.moveDown()
    doc.text(`Valor para Aluguel: R$ ${product.rentalValue.toFixed(2)}`)
    doc.moveDown()
    doc.text(
      `Categoria: ${
        // @ts-expect-error - A relação category existe em runtime mas TypeScript não reconhece
        product.category?.name || 'Não definida'
      }`,
    )

    doc.moveDown(2)

    // Descrição
    if (product.description) {
      doc.fontSize(14).font('Helvetica-Bold').text('Descrição:')
      doc.moveDown()
      doc.fontSize(12).font('Helvetica').text(product.description)
    }

    // Finaliza o PDF
    doc.end()

    // Aguarda a conclusão da gravação
    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        const fileUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${fileName}`
        resolve(fileUrl)
      })

      writeStream.on('error', reject)
    })
  }

  /**
   * Traduz o status do produto para texto em português
   */
  private translateStatus(status: ProductStatus): string {
    const statusMap = {
      AVAILABLE: 'Disponível',
      RENTED: 'Alugado',
      MAINTENANCE: 'Em Conserto',
      DISABLED: 'Desativado',
    }

    return statusMap[status] || status
  }
}
