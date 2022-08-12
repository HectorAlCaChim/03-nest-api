import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DataSource, Repository, TreeLevelColumn } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService');

  constructor(
  private readonly dataSource: DataSource,
  @InjectRepository(Product) 
  private readonly productoRepository: Repository<Product>,
  @InjectRepository(ProductImage) 
  private readonly productoImageRepository: Repository<ProductImage>,) {}

  async create(createProductDto: CreateProductDto, user: User) {

    try{
      const {images = [], ...productDetails } = createProductDto;
      const product = this.productoRepository.create({
        ...productDetails,
        user,
        images: images.map(image => this.productoImageRepository.create({
        url: image
        }))
      });
      await this.productoRepository.save(product);

      return {...product, images: images};

    } catch (error) {
      this.handleError(error);
    }
    return 'This action adds a new product';
  }

  async findAll(paginationDto: PaginationDto) {
    const {limit = 10, offset = 0 } = paginationDto;

    const products = await this.productoRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
    });

    return products.map(product => ({
      ...product,
      images: product.images.map(img => img.url)
    }))
  }

  async findOne(id: string) {
    let product: Product;
    if (isUUID(id)){
      product = await this.productoRepository.findOneBy({ id });
    } else {
      const query = this.productoRepository.createQueryBuilder();
      product = await query.where(`UPPER(title) =:title or slug =:slug`,{
        title: id.toUpperCase(),
        slug: id.toLowerCase()
      }).leftJoinAndSelect('prod.images','prodImages')
      .getOne();
    }
    if (!product) {
      throw new NotFoundException('Product not fount')
    }
    return product;
  }

  async findOnePlain(term: string) {
    const {images = [], ...rest} = await this.findOne(term);
    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }
  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    
    const {images, ...update} = updateProductDto;

    const product = await this.productoRepository.preload({
      id, 
      ...update,
    });
    if (!product) throw new NotFoundException('not found');

    // create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, {
          product: { id }
        });
        product.images = images.map(
          image => this.productoImageRepository.create({url: image}) 
        );
      } /*else {
        product.images = await this.productoImageRepository.findBy({
          product: {id}
        });
      }*/
      product.user = user;
      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
      // this.productoRepository.save(product)
    }catch(error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleError(error);
    }

    return product;
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productoRepository.remove(product);
    return product;
  }
  
  private handleError(error: any) {
    if (error.code == '23505'){
      throw new BadRequestException(error.detail);
    }
    // console.log(error);
    this.logger.error(error);
    throw new InternalServerErrorException('Error');
  }
  async deleteAllProducts() {
    const query = this.productoRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch(error) {
      this.handleError(error);
    }
  }
}
