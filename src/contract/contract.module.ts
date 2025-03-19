// src/contracts/contracts.module.ts
import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import { MulterModule } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync, mkdirSync } from 'fs'
import { ContractsService } from './contract.service'
import { ContractController } from './contract.controller'

// Garantir que o diretório de uploads existe
const uploadsDir = './uploads'
const templatesDir = './uploads/templates'

if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir)
}

if (!existsSync(templatesDir)) {
  mkdirSync(templatesDir)
}

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/templates',
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4()
          const ext = extname(file.originalname)
          cb(null, `template-${uniqueSuffix}${ext}`)
        },
      }),
    }),
  ],
  controllers: [ContractController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
