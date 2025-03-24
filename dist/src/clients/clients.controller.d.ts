import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(createClientDto: CreateClientDto): Promise<{
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
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
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
        email: string;
        phone: string;
        imageUrl: string | null;
        cpfCnpj: string;
        instagram: string | null;
    }[]>;
    findOne(id: string): Promise<{
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
    }>;
    update(id: string, updateClientDto: UpdateClientDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    uploadImage(id: string, file: Express.Multer.File): Promise<{
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
    }>;
}
