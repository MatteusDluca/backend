import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
export declare class LocationsController {
    private locationsService;
    constructor(locationsService: LocationsService);
    findAll(): Promise<({
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
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        addressId: string | null;
    })[]>;
    findOne(id: string): Promise<({
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
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        addressId: string | null;
    }) | null>;
    create(createLocationDto: CreateLocationDto): Promise<{
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
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        addressId: string | null;
    }>;
    update(id: string, updateLocationDto: UpdateLocationDto): Promise<{
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
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        addressId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        addressId: string | null;
    }>;
}
