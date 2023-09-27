import { Injectable, InternalServerErrorException, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid'; 
import { ProductImage } from './entities/product-image.entity';
import { v4 as UUID } from "uuid";

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProcuctService');

  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource

  ) { }

  async create(createProductDto: CreateProductDto, files: Express.Multer.File[]) {
    try {
      let { images } = createProductDto;
      const imagesParsed: any[]= JSON.parse(images);
      console.log(images)
      console.log(imagesParsed)
      const product = this.productRepository.create({
        ...createProductDto,
        images: files.map( file => {
          if(imagesParsed && imagesParsed.length>0){
            const {title} = imagesParsed.find(element => element.imageName == file.originalname)
            return this.productImageRepository.create({url: file.originalname, titulo: title})
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

  async findOne(term: string) {
    try {
      let product: Product;
      if(isUUID(term)){
        product = await this.productRepository.findOneBy({id: term});
      }else{
        throw new BadRequestException(`Producto buscado no existe.`)
      }
      if(!product){
        throw new NotFoundException(`Producto con id: ${term} no encontrado.`)
      }
      return product;
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async findOnePlane(term: string){
    const {images = [], ...productDetails} = await this.findOne(term);
    return {...productDetails, images: images.map( image => image.url)}
  }



  private handleDBExeptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail)
    this.logger.error(error);
    throw new InternalServerErrorException(`Unexpected error, check server logs!`)
  }

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExeptions(error)
    }
  }
}
