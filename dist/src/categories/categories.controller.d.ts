import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        status: import(".prisma/client").$Enums.CategoryStatus;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        status: import(".prisma/client").$Enums.CategoryStatus;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        status: import(".prisma/client").$Enums.CategoryStatus;
    }>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        status: import(".prisma/client").$Enums.CategoryStatus;
    }>;
    remove(id: string): Promise<void>;
    uploadImage(id: string, file: Express.Multer.File): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        status: import(".prisma/client").$Enums.CategoryStatus;
    }>;
}
