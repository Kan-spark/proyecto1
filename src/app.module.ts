import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config'
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  }), UsersModule, ProductsModule, OrdersModule, ReviewsModule, AuthModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
