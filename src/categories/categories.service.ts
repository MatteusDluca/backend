// src/categories/categories.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { UploadService } from '../upload/upload.service'
import { Category } from '@prisma/client'

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  /**
   * Cria uma nova categoria
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Verifica se já existe uma categoria com o mesmo nome
    const existingCategory = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    })

    if (existingCategory) {
      throw new ConflictException('Já existe uma categoria com este nome')
    }

    return this.prisma.category.create({
      data: createCategoryDto,
    })
  }

  /**
   * Retorna todas as categorias
   */
  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    })
  }

  /**
   * Busca uma categoria pelo ID
   */
  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
      },
    })

    if (!category) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`)
    }

    return category
  }

  /**
   * Atualiza uma categoria
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    // Verifica se a categoria existe
    await this.findOne(id)

    // Verifica se está tentando atualizar para um nome que já existe
    if (updateCategoryDto.name) {
      const existingCategory = await this.prisma.category.findUnique({
        where: { name: updateCategoryDto.name },
      })

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Já existe uma categoria com este nome')
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    })
  }

  /**
   * Remove uma categoria
   */
  async remove(id: string): Promise<void> {
    const category = await this.findOne(id)

    // Se a categoria tem uma imagem, remove-a primeiro
    if (category.imageUrl) {
      await this.uploadService.deleteFile(category.imageUrl)
    }

    await this.prisma.category.delete({
      where: { id },
    })
  }

  /**
   * Atualiza a imagem de uma categoria
   */
  async updateImage(
    id: string,
    imageBuffer: Buffer,
    fileName: string,
  ): Promise<Category> {
    // Verifica se a categoria existe
    const category = await this.findOne(id)

    // Se já existe uma imagem, exclua-a primeiro
    if (category.imageUrl) {
      await this.uploadService.deleteFile(category.imageUrl)
    }

    // Faz upload da nova imagem
    const imageUrl = await this.uploadService.uploadFile(imageBuffer, fileName)

    // Atualiza a categoria com a nova URL da imagem
    return this.prisma.category.update({
      where: { id },
      data: { imageUrl },
    })
  }
}
