import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { MessagesWsModule } from './messages-ws/messages-ws.module';
@Module({
  imports: [ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, // false en produccion
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'),
    }),
    ProductsModule,
    CommonModule,
    SeedModule,
    FilesModule,
    AuthModule,
    MessagesWsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
