import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UploadService } from '../upload/upload.service';
import { Category } from '@prisma/client';
export declare class CategoriesService {
    private prisma;
    private uploadService;
    constructor(prisma: PrismaService, uploadService: UploadService);
    create(createCategoryDto: CreateCategoryDto): Promise<Category>;
    findAll(): Promise<Category[]>;
    findOne(id: string): Promise<Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category>;
    remove(id: string): Promise<void>;
    updateImage(id: string, imageBuffer: Buffer, fileName: string): Promise<Category>;
}
