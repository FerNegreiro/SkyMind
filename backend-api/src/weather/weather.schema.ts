import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherLogDocument = HydratedDocument<WeatherLog>;

@Schema({ timestamps: true }) 
export class WeatherLog {
  @Prop()
  city: string; 

  @Prop()
  temperature: number;

  @Prop()
  humidity: number;

  @Prop()
  windSpeed: number;

  @Prop()
  conditionCode: number; 
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);