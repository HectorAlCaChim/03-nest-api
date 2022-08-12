import { Controller, Get, Post, Param, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter } from './helper/fileFilter';
import { fileNamer } from './helper/fileNamer';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService,
    private readonly configService: ConfigService) {}

  @Get('product/:imageName')
  async findImage(@Param('imageName') imageName: string, @Res() res: Response) {
    const path = this.filesService.getStaticImage(imageName);

    res.sendFile(path);
    return path;
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', 
  {fileFilter: fileFilter, storage: diskStorage({
    destination: './static/uploads',
    filename: fileNamer
  })
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File){
    if (!file) {
      throw new BadRequestException('Make sure that the file is a image')
    }
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`
    return {secureUrl};
  }
}
