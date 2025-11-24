import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherLog, WeatherLogSchema } from './weather/weather.schema';
import { WeatherController } from './weather/weather.controller';
import { WeatherService } from './weather/weather.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CarsModule } from './cars/cars.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://skymind_mongo:27017/skymind_db'),
    MongooseModule.forFeature([{ name: WeatherLog.name, schema: WeatherLogSchema }]),
    UsersModule,
    AuthModule,
    CarsModule,
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class AppModule {}