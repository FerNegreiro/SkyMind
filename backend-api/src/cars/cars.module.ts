import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';

@Module({
  imports: [HttpModule],
  controllers: [CarsController],
  providers: [CarsService],
})
export class CarsModule {}