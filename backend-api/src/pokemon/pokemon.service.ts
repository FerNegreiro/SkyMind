import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';


 
 
@Injectable()
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2/pokemon';

  constructor(private readonly httpService: HttpService) {}

  async findAll(limit: number, offset: number): Promise<any> {
    try {
      
      const listResponse = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}?limit=${limit}&offset=${offset}`),
      );

      const data = listResponse.data;

      
      const pokemonPromises = data.results.map(async (pokemon: any) => {
        const detailResponse = await firstValueFrom(
          this.httpService.get(pokemon.url),
        );
        const details = detailResponse.data;

        
        return {
          id: details.id,
          name: details.name.charAt(0).toUpperCase() + details.name.slice(1),
          imageUrl: details.sprites.front_default,
          types: details.types.map(t => t.type.name),
        };
      });

      const pokemons = await Promise.all(pokemonPromises);

      
      return {
        count: data.count,
        next: data.next,
        previous: data.previous,
        results: pokemons,
      };
    } catch (error) {
      console.error('Erro ao buscar dados da PokeAPI:', error.message);
      throw new InternalServerErrorException('Falha na integração com a PokeAPI.');
    }
  }
}