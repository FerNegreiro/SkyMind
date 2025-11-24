import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CarsService } from './cars.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Query('page') page: string) {
    return this.carsService.findAll(Number(page) || 1);
  }
}