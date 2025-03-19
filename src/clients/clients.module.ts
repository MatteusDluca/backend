import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { ClientsService } from './clients.service'
import { ClientsController } from './clients.controller'
import { existsSync, mkdirSync } from 'fs'

// Garantir que o diretório de uploads existe
const uploadsDir = './uploads'
const clientUploadsDir = './uploads/clients'

if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir)
}

if (!existsSync(clientUploadsDir)) {
  mkdirSync(clientUploadsDir)
}

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/clients',
    }),
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
