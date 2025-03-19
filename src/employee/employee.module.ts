import { Module } from '@nestjs/common'
import { EmployeesService } from './employee.service'
import { EmployeesController } from './employee.controller'
import { UploadService } from 'src/upload/upload.service'

@Module({
  imports: [],
  controllers: [EmployeesController],
  providers: [EmployeesService, UploadService],
})
export class EmployeesModule {}
