// src/locations/locations.service.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLocationDto } from './dto/create-location.dto'
import { UpdateLocationDto } from './dto/update-location.dto'

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.location.findMany({
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
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: string) {
    return this.prisma.location.findUnique({
      where: { id },
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
  }

  async create(data: CreateLocationDto) {
    // Primeiro, verificamos se precisamos criar rua, cidade e estado
    let addressId

    if (data.street && data.city && data.state) {
      // Verifica ou cria o estado
      const state = await this.prisma.state.upsert({
        where: { name: data.state },
        update: {},
        create: {
          name: data.state,
          uf: data.state.substring(0, 2).toUpperCase(),
        },
      })

      // Verifica ou cria a cidade
      const city = await this.prisma.city.upsert({
        where: {
          name_stateId: {
            name: data.city,
            stateId: state.id,
          },
        },
        update: {},
        create: {
          name: data.city,
          stateId: state.id,
        },
      })

      // Verifica ou cria a rua
      const street = await this.prisma.street.upsert({
        where: { name: data.street },
        update: {},
        create: { name: data.street },
      })

      // Cria o endereço
      const address = await this.prisma.address.create({
        data: {
          streetId: street.id,
          number: data.number || '',
          complement: data.complement,
          zipCode: data.zipCode || '',
          cityId: city.id,
        },
      })

      addressId = address.id
    }

    // Agora cria o local com o endereço criado
    return this.prisma.location.create({
      data: {
        name: data.name,
        addressId,
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
  }

  async update(id: string, data: UpdateLocationDto) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: { address: true },
    })

    let addressId = location?.addressId

    // Se temos novos dados de endereço
    if (data.street || data.city || data.state) {
      // Se já existe um endereço, atualiza
      if (addressId) {
        const address = await this.prisma.address.findUnique({
          where: { id: addressId },
          include: { street: true, city: { include: { state: true } } },
        })

        // Atualiza estado, cidade e rua conforme necessário
        if (
          data.state &&
          address?.city?.state &&
          data.state !== address.city.state.name
        ) {
          const state = await this.prisma.state.upsert({
            where: { name: data.state },
            update: {},
            create: {
              name: data.state,
              uf: data.state.substring(0, 2).toUpperCase(),
            },
          })

          const city = await this.prisma.city.upsert({
            where: {
              name_stateId: {
                name: data.city || address?.city?.name,
                stateId: state.id,
              },
            },
            update: {},
            create: {
              name: data.city || address.city.name,
              stateId: state.id,
            },
          })

          // Atualiza o endereço com a nova cidade
          await this.prisma.address.update({
            where: { id: addressId },
            data: { cityId: city.id },
          })
        }

        if (data.city && address?.city && data.city !== address.city.name) {
          const city = await this.prisma.city.upsert({
            where: {
              name_stateId: {
                name: data.city,
                stateId: address?.city?.state?.id,
              },
            },
            update: {},
            create: {
              name: data.city,
              stateId: address.city.state.id,
            },
          })

          // Atualiza o endereço com a nova cidade
          await this.prisma.address.update({
            where: { id: addressId },
            data: { cityId: city.id },
          })
        }

        if (
          data.street &&
          address?.street &&
          data.street !== address.street.name
        ) {
          const street = await this.prisma.street.upsert({
            where: { name: data.street },
            update: {},
            create: { name: data.street },
          })

          // Atualiza o endereço com a nova rua
          await this.prisma.address.update({
            where: { id: addressId },
            data: { streetId: street.id },
          })
        }

        // Atualiza número, complemento e CEP
        if (data.number || data.complement || data.zipCode) {
          await this.prisma.address.update({
            where: { id: addressId },
            data: {
              number: data.number !== undefined ? data.number : address?.number,
              complement:
                data.complement !== undefined
                  ? data.complement
                  : address?.complement,
              zipCode:
                data.zipCode !== undefined ? data.zipCode : address?.zipCode,
            },
          })
        }
      } else {
        // Cria um novo endereço do zero
        // Primeiro, verificamos ou criamos rua, cidade e estado
        if (data.street && data.city && data.state) {
          // Verifica ou cria o estado
          const state = await this.prisma.state.upsert({
            where: { name: data.state },
            update: {},
            create: {
              name: data.state,
              uf: data.state.substring(0, 2).toUpperCase(),
            },
          })

          // Verifica ou cria a cidade
          const city = await this.prisma.city.upsert({
            where: {
              name_stateId: {
                name: data.city,
                stateId: state.id,
              },
            },
            update: {},
            create: {
              name: data.city,
              stateId: state.id,
            },
          })

          // Verifica ou cria a rua
          const street = await this.prisma.street.upsert({
            where: { name: data.street },
            update: {},
            create: { name: data.street },
          })

          // Cria o endereço
          const address = await this.prisma.address.create({
            data: {
              streetId: street.id,
              number: data.number || '',
              complement: data.complement,
              zipCode: data.zipCode || '',
              cityId: city.id,
            },
          })

          addressId = address.id
        }
      }
    }

    // Agora atualiza o local com o nome atualizado e possivelmente um novo endereço
    return this.prisma.location.update({
      where: { id },
      data: {
        name: data.name,
        addressId,
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
  }

  async delete(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: { address: true },
    })

    // Primeiro excluímos o local
    const deleted = await this.prisma.location.delete({
      where: { id },
    })

    // Se o local tinha um endereço, excluímos também
    if (location?.addressId) {
      await this.prisma.address.delete({
        where: { id: location?.addressId },
      })
    }

    return deleted
  }
}
