import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ArrowLeft, ArrowRight, ArrowLeftCircle, Loader2, Zap, Cloud, Frown, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
}

export function Explorar() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const limit = 10; 

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/');
  }, [navigate]);

  const fetchPokemons = useCallback(async (pageNumber: number) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      handleLogout();
      return;
    }

    setLoading(true);
    setError(null);
    const offset = (pageNumber - 1) * limit;
    
    try {
      
      const response = await axios.get(`http://localhost:3000/pokemon?limit=${limit}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPokemons(response.data.results);
      setTotalPages(Math.ceil(response.data.count / limit));
      
    } catch (err: any) {
      console.error("Erro ao buscar Pokémons:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
          handleLogout();
      } else {
          setError("Não foi possível carregar Pokémons. Tente novamente mais tarde.");
      }
      setPokemons([]);
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    fetchPokemons(page);
  }, [page, fetchPokemons]);

  return (
    <div className="min-h-screen p-8 font-sans bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-6 mb-8 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-900 rounded-full"
              title="Voltar ao Dashboard"
            >
              <ArrowLeftCircle size={32} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Exploração Pokémon
              </h1>
              <p className="text-slate-400 text-sm">Integração PokeAPI via NestJS (BFF)</p>
            </div>
          </div>

          {/* Paginação */}
          <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-xl border border-slate-800">
            <button 
              disabled={page === 1 || loading}
              onClick={() => setPage(p => p - 1)}
              className="p-2 bg-slate-800 rounded-lg disabled:opacity-30 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="font-mono text-xl font-bold w-12 text-center text-yellow-500">
                {page} / {totalPages}
            </span>
            <button 
              disabled={loading || page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 bg-slate-800 rounded-lg disabled:opacity-30 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </header>

        {error && (
            <div className="text-center py-10 text-red-400 bg-red-900/10 rounded-xl border border-red-900/50 mb-6">
                <p>{error}</p>
            </div>
        )}

        {loading && pokemons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
            <Loader2 size={48} className="animate-spin text-yellow-500" />
            <p>A carregar Pokémons...</p>
          </div>
        ) : (
          <>
            {pokemons.length === 0 && !error ? (
              <div className="text-center py-20 text-slate-500">
                <Frown size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nenhum Pokémon encontrado nesta página.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 animate-fade-in">
                {pokemons.map((pokemon) => (
                  <div key={pokemon.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center hover:border-yellow-500/50 transition-all hover:-translate-y-1 hover:shadow-lg group cursor-pointer">
                    <div className="w-28 h-28 bg-slate-950 rounded-full flex items-center justify-center mb-4 relative overflow-hidden border border-slate-800 group-hover:border-yellow-500/30 transition-colors">
                        <img 
                            src={pokemon.imageUrl} 
                            alt={pokemon.name} 
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/96x96/facc15/000?text=NO+IMG';
                            }}
                            className="w-20 h-20 z-10 drop-shadow-xl group-hover:scale-110 transition-transform duration-300" 
                        />
                    </div>
                    <h3 className="capitalize font-bold text-slate-200 text-lg tracking-wide group-hover:text-yellow-400 transition-colors">
                        {pokemon.name}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {pokemon.types.map(type => (
                            <span key={type} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}