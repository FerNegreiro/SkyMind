import { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, ArrowRight, ArrowLeftCircle, Loader2, Frown } from 'lucide-react';
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
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const limit = 12;

  const fetchPokemons = async (pageNumber: number) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const offset = (pageNumber - 1) * limit;
      
      
      const response = await axios.get(`http://localhost:3000/pokemon?limit=${limit}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data.results)) {
          setPokemons(response.data.results);
          setTotalPages(Math.ceil(response.data.count / limit));
      } else {
          setPokemons([]);
      }

    } catch (err) {
      console.error(err);
      setError("Erro ao carregar Pokémons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemons(page);
  }, [page]);

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
                Explorar API
              </h1>
              <p className="text-slate-400 text-sm">Integração PokéAPI via NestJS</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-xl border border-slate-800">
            <button 
              disabled={page === 1 || loading}
              onClick={() => setPage(p => p - 1)}
              className="p-2 bg-slate-800 rounded-lg disabled:opacity-30 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="font-mono text-xl font-bold w-20 text-center text-yellow-500">
                {page} / {totalPages || '?'}
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
                <button onClick={() => fetchPokemons(page)} className="mt-4 underline text-sm hover:text-red-300">Tentar novamente</button>
            </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
            <Loader2 size={48} className="animate-spin text-yellow-500" />
            <p>Capturando Pokémons...</p>
          </div>
        ) : (
          <>
            {pokemons.length === 0 && !error ? (
              <div className="text-center py-20 text-slate-500">
                <Frown size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nenhum Pokémon encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 animate-fade-in">
                {pokemons.map((poke) => (
                  <div key={poke.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center hover:border-yellow-500/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-500/10 group cursor-pointer relative overflow-hidden">
                    
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="w-32 h-32 flex items-center justify-center mb-4 relative z-10">
                        <img 
                            src={poke.imageUrl} 
                            alt={poke.name}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/96x96/facc15/000?text=?';
                            }} 
                            className="w-full h-full object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300" 
                        />
                    </div>
                    
                    <h3 className="capitalize font-bold text-slate-200 text-lg tracking-wide group-hover:text-yellow-400 transition-colors z-10">
                        {poke.name}
                    </h3>
                    
                    <div className="flex gap-1 mt-2 z-10 flex-wrap justify-center">
                      {poke.types.map((t) => (
                        <span key={t} className="text-[10px] uppercase font-bold px-2 py-1 bg-slate-800 rounded-full text-slate-400 border border-slate-700">
                          {t}
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