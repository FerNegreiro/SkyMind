import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { AuthGuard } from '@nestjs/passport';



@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @UseGuards(AuthGuard('jwt')) 
  @Get()
  async findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.pokemonService.findAll(limit, offset);
  }
}