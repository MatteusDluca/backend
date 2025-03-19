/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Criar estado
  const state = await prisma.state.upsert({
    where: { uf: 'CE' },
    update: {},
    create: {
      name: 'Ceará',
      uf: 'CE',
    },
  })
  console.log('State created:', state.name)

  // Criar cidade
  const city = await prisma.city.upsert({
    where: {
      name_stateId: {
        name: 'Fortaleza',
        stateId: state.id,
      },
    },
    update: {},
    create: {
      name: 'Fortaleza',
      stateId: state.id,
    },
  })
  console.log('City created:', city.name)

  // Criar rua
  const street = await prisma.street.upsert({
    where: { name: 'Avenida Beira Mar' },
    update: {},
    create: {
      name: 'Avenida Beira Mar',
    },
  })
  console.log('Street created:', street.name)

  // Criar endereço
  const address = await prisma.address.create({
    data: {
      streetId: street.id,
      number: '1500',
      complement: 'Apt 304',
      zipCode: '60165-121',
      cityId: city.id,
    },
  })
  console.log('Address created')

  // Criar funcionário
  const employee = await prisma.employee.upsert({
    where: { email: 'matteus@exemplo.com' },
    update: {},
    create: {
      name: 'Matteus Silva',
      email: 'matteus@exemplo.com',
      cpf: '61794968385', // CPF sem formatação
      password: '61794968385', // CPF como senha
      salary: 5000,
      phone: '85999887766',
      role: 'ADMIN',
      workHours: '08:00 - 17:00',
      birthday: '1990-05-15',
      addressId: address.id,
    },
  })
  console.log('Employee created:', employee.name)

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
