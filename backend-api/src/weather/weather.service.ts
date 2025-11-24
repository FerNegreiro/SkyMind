import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from './weather.schema';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLog>,
  ) {}

  async create(data: any) {
    const newData = new this.weatherModel({
      ...data,
      city: 'São Paulo',
    });
    return newData.save();
  }

  async findAll() {
    
    const logs = await this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();

    
    
    if (logs.length > 0) {
      const current = logs[0]; 
      const insight = this.generateInsight(current);
      
      
      return {
        logs: logs,
        insight: insight
      };
    }

    return { logs: [], insight: null };
  }

  
  private generateInsight(data: WeatherLog): string {
    const { temperature, humidity, windSpeed } = data;

    if (temperature > 30) return "🔥 Alerta de Calor Extremo! Hidrate-se e evite sol direto.";
    if (temperature < 15) return "❄️ Frente Fria detectada. Recomenda-se agasalho pesado.";
    if (humidity < 30) return "🌵 Ar muito seco. Atenção para problemas respiratórios.";
    if (windSpeed > 20) return "💨 Ventos fortes na região. Cuidado com janelas e objetos soltos.";
    
    return "✅ Condições climáticas normais e agradáveis.";
  }
}