/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import * as fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class UploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads')
  private readonly baseUrl = process.env.BASE_URL || 'http://localhost:3000'

  constructor() {
    // Create uploads directory if not exists
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  /**
   * Uploads a file to the server
   * @param file - The file buffer
   * @param fileName - Original file name (used to get extension)
   * @returns The URL of the uploaded file
   */
  async uploadFile(file: Buffer, fileName: string): Promise<string> {
    const fileExtension = fileName.split('.').pop()
    const fileId = uuidv4()
    const newFileName = `${fileId}.${fileExtension}`
    const filePath = join(this.uploadDir, newFileName)

    await fs.writeFile(filePath, file)

    return `${this.baseUrl}/uploads/${newFileName}`
  }

  /**
   * Deletes a file from the server
   * @param fileUrl - URL of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    const fileName = fileUrl.split('/').pop()
    if (!fileName) return

    const filePath = join(this.uploadDir, fileName)

    try {
      await fs.access(filePath)
      await fs.unlink(filePath)
    } catch (error) {
      // File doesn't exist, no need to delete
    }
  }
}
