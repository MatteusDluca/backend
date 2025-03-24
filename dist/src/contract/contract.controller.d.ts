import { ContractsService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { FilterContractsDto } from './dto/filter-contracts.dto';
export declare class ContractController {
    private readonly contractsService;
    constructor(contractsService: ContractsService);
    generateAllPdf(): Promise<string>;
    generateAllPdfAlt(): Promise<string>;
    create(createContractDto: CreateContractDto): Promise<({
        client: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            phone: string;
            imageUrl: string | null;
            addressId: string | null;
            cpfCnpj: string;
            instagram: string | null;
            measurementsId: string | null;
        };
        event: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            date: string | null;
            time: string | null;
            eventCategoryId: string | null;
        } | null;
        location: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            addressId: string | null;
        } | null;
        items: ({
            product: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                imageUrl: string | null;
                status: import(".prisma/client").$Enums.ProductStatus;
                code: string;
                size: string;
                quantity: number;
                description: string | null;
                rentalValue: number;
                categoryId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            quantity: number;
            productId: string;
            unitValue: number;
            contractId: string;
        })[];
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            method: import(".prisma/client").$Enums.PaymentMethod;
            totalValue: number;
            discountType: import(".prisma/client").$Enums.DiscountType | null;
            discountValue: number | null;
            finalValue: number;
            notes: string | null;
            contractId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ContractStatus;
        clientId: string;
        eventId: string | null;
        locationId: string | null;
        fittingDate: Date | null;
        pickupDate: Date;
        returnDate: Date;
        needsAdjustment: boolean;
        observations: string | null;
    }) | null>;
    findAll(filters: FilterContractsDto): Promise<({
        client: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            phone: string;
            imageUrl: string | null;
            addressId: string | null;
            cpfCnpj: string;
            instagram: string | null;
            measurementsId: string | null;
        };
        event: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            date: string | null;
            time: string | null;
            eventCategoryId: string | null;
        } | null;
        location: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            addressId: string | null;
        } | null;
        items: ({
            product: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                imageUrl: string | null;
                status: import(".prisma/client").$Enums.ProductStatus;
                code: string;
                size: string;
                quantity: number;
                description: string | null;
                rentalValue: number;
                categoryId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            quantity: number;
            productId: string;
            unitValue: number;
            contractId: string;
        })[];
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            method: import(".prisma/client").$Enums.PaymentMethod;
            totalValue: number;
            discountType: import(".prisma/client").$Enums.DiscountType | null;
            discountValue: number | null;
            finalValue: number;
            notes: string | null;
            contractId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ContractStatus;
        clientId: string;
        eventId: string | null;
        locationId: string | null;
        fittingDate: Date | null;
        pickupDate: Date;
        returnDate: Date;
        needsAdjustment: boolean;
        observations: string | null;
    })[]>;
    generatePdf(id: string): Promise<string>;
    findOne(id: string): Promise<{
        client: {
            address: ({
                city: {
                    state: {
                        id: string;
                        name: string;
                        uf: string;
                        createdAt: Date;
                        updatedAt: Date;
                    };
                } & {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    stateId: string;
                };
                street: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                number: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                streetId: string;
                complement: string | null;
                zipCode: string;
                cityId: string;
            }) | null;
            measurements: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                shoulder: number | null;
                bust: number | null;
                shoulderToWaistLength: number | null;
                shoulderToCosLength: number | null;
                tqcLength: number | null;
                waist: number | null;
                cos: number | null;
                hip: number | null;
                shortSkirtLength: number | null;
                longSkirtLength: number | null;
                shortLength: number | null;
                pantsLength: number | null;
                dressLength: number | null;
                sleeveLength: number | null;
                wrist: number | null;
                frontMeasure: number | null;
                shoulderToShoulderWidth: number | null;
            } | null;
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            phone: string;
            imageUrl: string | null;
            addressId: string | null;
            cpfCnpj: string;
            instagram: string | null;
            measurementsId: string | null;
        };
        event: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            date: string | null;
            time: string | null;
            eventCategoryId: string | null;
        } | null;
        location: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            addressId: string | null;
        } | null;
        items: ({
            product: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                imageUrl: string | null;
                status: import(".prisma/client").$Enums.ProductStatus;
                code: string;
                size: string;
                quantity: number;
                description: string | null;
                rentalValue: number;
                categoryId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            quantity: number;
            productId: string;
            unitValue: number;
            contractId: string;
        })[];
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            method: import(".prisma/client").$Enums.PaymentMethod;
            totalValue: number;
            discountType: import(".prisma/client").$Enums.DiscountType | null;
            discountValue: number | null;
            finalValue: number;
            notes: string | null;
            contractId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ContractStatus;
        clientId: string;
        eventId: string | null;
        locationId: string | null;
        fittingDate: Date | null;
        pickupDate: Date;
        returnDate: Date;
        needsAdjustment: boolean;
        observations: string | null;
    }>;
    update(id: string, updateContractDto: UpdateContractDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ContractStatus;
        clientId: string;
        eventId: string | null;
        locationId: string | null;
        fittingDate: Date | null;
        pickupDate: Date;
        returnDate: Date;
        needsAdjustment: boolean;
        observations: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
