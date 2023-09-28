import { Controller, Get, Post, Body, Query, Param, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}


  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './static/products', 
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
      fileFilter: (req, file, cb) => {
        if(!file) return cb(new Error('Files is empty'), false);
        const fileExtension = file.mimetype.split('/')[1];
        const validExtensions = ["jpg","jpeg", "png"];
        if(validExtensions.includes(fileExtension)) return cb(null, true)
        cb(new BadRequestException(`La imagen ${file.originalname} no es aceptada, por favor revisar que sean extension png o jpg.`), false)
      },
    }),
  )
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files?: Express.Multer.File[]
    ) {
    return this.productsService.create(createProductDto, files);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.productsService.findOnePlane(term);
  }
}
