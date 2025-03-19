import { Module } from '@nestjs/common'
import { UploadService } from './upload.service'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
