import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CarsService {
  private readonly logger = new Logger(CarsService.name);

  constructor(private readonly httpService: HttpService) {}

  async findAll(page: number = 1) {
    const limit = 12;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    let data = [];

    try {
      
      const response = await firstValueFrom(
        this.httpService.get(`https://freetestapi.com/api/v1/cars`)
      );
      data = response.data;
    } catch (error) {
      this.logger.error(`Erro ao buscar carros externos: ${error.message}. Usando fallback.`);
      
      
      data = [
        { id: 1, make: "Toyota", model: "Corolla", year: 2022, price: 25000 },
        { id: 2, make: "Honda", model: "Civic", year: 2023, price: 28000 },
        { id: 3, make: "Ford", model: "Mustang", year: 2021, price: 55000 },
        { id: 4, make: "Chevrolet", model: "Camaro", year: 2022, price: 60000 },
        { id: 5, make: "Tesla", model: "Model 3", year: 2023, price: 45000 },
        { id: 6, make: "BMW", model: "3 Series", year: 2022, price: 42000 },
        { id: 7, make: "Audi", model: "A4", year: 2023, price: 48000 },
        { id: 8, make: "Mercedes", model: "C-Class", year: 2022, price: 52000 },
        { id: 9, make: "Porsche", model: "911", year: 2021, price: 120000 },
        { id: 10, make: "Ferrari", model: "488", year: 2020, price: 250000 },
        { id: 11, make: "Lamborghini", model: "Huracan", year: 2021, price: 280000 },
        { id: 12, make: "Bugatti", model: "Chiron", year: 2022, price: 3000000 },
      ];
    }

    
    const total = data.length;
    
    const safeStart = Math.min(start, total);
    const safeEnd = Math.min(end, total);
    
    const paginatedData = data.slice(safeStart, safeEnd).map((car: any) => ({
      id: car.id,
      name: `${car.make} ${car.model}`,
      year: car.year,
      price: car.price,
      
      image: `https://loremflickr.com/320/240/car,supercar?lock=${car.id}`
    }));

    return {
      data: paginatedData,
      page,
      totalPages: Math.ceil(total / limit),
      total
    };
  }
}