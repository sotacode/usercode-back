import { Injectable, InternalServerErrorException, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid'; 
import { ProductImage } from './entities/product-image.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProcuctService');

  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly configService: ConfigService, 

  ) { }

  async create(createProductDto: CreateProductDto, files: Express.Multer.File[]) {
    try {
      let { images } = createProductDto;
      const imagesParsed: any[]= JSON.parse(images);
      const product = this.productRepository.create({
        ...createProductDto,
        images: files.map( file => {
          if(imagesParsed && imagesParsed.length>0){
            const {title} = imagesParsed.find(element => element.imageName == file.originalname)
            return this.productImageRepository.create({url: `${this.configService.get('HOST_API')}/files/product/${file.originalname}`, titulo: title})
          }
        })
      });
      const productDone = await this.productRepository.save(product);
      return productDone;
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    try {
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true
        }
      });
      return products.map( product => ({
        ...product,
        images: product.images.map( img => img.url )
      }) )
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async findOne(id: string) {
    try {
      let product: Product;
      if(isUUID(id)){
        product = await this.productRepository.findOneBy({id});
      }else{
        throw new BadRequestException(`Producto buscado no existe.`)
      }
      if(!product){
        throw new NotFoundException(`Producto con id: ${id} no encontrado.`)
      }
      console.log(product)
      return product;
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async findOnePlane(term: string){
    const {images = [], ...productDetails} = await this.findOne(term);
    return {...productDetails, images: images.map( image => ({title: image.titulo, url: image.url}))}
  }



  private handleDBExeptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail)
    this.logger.error(error);
    throw new InternalServerErrorException(`Unexpected error, check server logs!`)
  }
}
