import { Body, Controller, Get, Post, Res, Header, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport'; 

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  
  
  @Post()
  async create(@Body() createWeatherDto: any) {
    return this.weatherService.create(createWeatherDto);
  }

  
  @UseGuards(AuthGuard('jwt')) 
  @Get()
  async findAll() {
    return this.weatherService.findAll();
  }

  
  @UseGuards(AuthGuard('jwt')) 
  @Get('export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="relatorio_clima.csv"')
  async exportCsv(@Res() res: Response) {
    const data = await this.weatherService.findAll();
    const logs = data.logs;

    let csv = 'Data,Cidade,Temperatura (C),Umidade (%),Vento (km/h)\n';

    logs.forEach((log) => {
      const date = new Date(log['createdAt']).toLocaleString('pt-BR');
      csv += `${date},${log.city},${log.temperature},${log.humidity},${log.windSpeed}\n`;
    });

    res.send(csv);
  }
}