import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ProductsService } from 'src/products/products.service';
import { Repository } from 'typeorm';
import { initialData } from './data/see';

@Injectable()
export class SeedService {
  
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>) {}

  async runSeed() {
    await this.deleteTables();
    const u = await this.insertUsers();
    await this.insertNewProducts(u);
    return `This action returns all seed`;
  }
  private async insertUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach( x => {
      users.push(this.userRepository.create(x));
    });

    const dbUsers = await this.userRepository.save(seedUsers);

    return dbUsers[0]

  }
  private async deleteTables() {
    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();

  }
  private async insertNewProducts(user: User){
    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach(product =>{
      insertPromises.push(
        this.productsService.create(product, user)
      );
    });

    await Promise.all(insertPromises);

    return true;
  }
}
