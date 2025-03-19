import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { ClientsService } from './clients.service'
import { CreateClientDto } from './dto/create-client.dto'
import { UpdateClientDto } from './dto/update-client.dto'
import { diskStorage } from 'multer'
import { extname } from 'path'

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto)
  }

  @Get()
  findAll() {
    return this.clientsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(id, updateClientDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id)
  }

  @Post(':id/upload-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/clients',
        filename: (req, file, cb) => {
          // Criar um nome de arquivo único com timestamp
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9)
          const ext = extname(file.originalname)
          cb(null, `client-${req.params.id}-${uniqueSuffix}${ext}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        // Aceitar apenas imagens
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException(
              'Somente arquivos de imagem são permitidos!',
            ),
            false,
          )
        }
        cb(null, true)
      },
    }),
  )
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // Criar URL para o arquivo
    const imageUrl = `${process.env.API_URL || 'http://localhost:3000'}/uploads/clients/${file.filename}`

    // Atualizar cliente com URL da imagem
    return this.clientsService.uploadImage(id, imageUrl)
  }
}
