import { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, ArrowRight, ArrowLeftCircle, Loader2, Calendar, DollarSign, Car as CarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Car {
  id: number;
  name: string;
  year: number;
  price: number;
  image: string;
}

export function Explorar() {
  const [cars, setCars] = useState<Car[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCars = async (pageNumber: number) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:3000/cars?page=${pageNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data.data)) {
        setCars(response.data.data);
      } else {
        setCars([]);
      }

    } catch (err: any) {
      console.error("Erro ao buscar Carros:", err);
      setError("Não foi possível carregar os veículos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars(page);
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
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                Garagem SkyMind
              </h1>
              <p className="text-slate-400 text-sm">Veículos via API</p>
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
            <span className="font-mono text-xl font-bold w-12 text-center text-orange-500">
                {page}
            </span>
            <button 
              disabled={loading || cars.length === 0}
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
            <button onClick={() => fetchCars(page)} className="mt-4 underline text-sm hover:text-red-300">Tentar novamente</button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
            <Loader2 size={48} className="animate-spin text-orange-500" />
            <p>A carregar a frota...</p>
          </div>
        ) : (
          <>
            {cars.length === 0 && !error ? (
              <div className="text-center py-20 text-slate-500">
                <CarIcon size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nenhum veículo encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                {cars.map((car) => (
                  <div key={car.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all hover:-translate-y-1 hover:shadow-lg group">
                    <div className="h-48 overflow-hidden relative bg-slate-800">
                        <img 
                            src={car.image} 
                            alt={car.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/320x240/1e293b/FFF?text=Carro';
                            }}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent h-20" />
                    </div>
                    <div className="p-5 relative">
                        <h3 className="font-bold text-xl text-slate-100 mb-2 truncate" title={car.name}>{car.name}</h3>
                        
                        <div className="flex justify-between items-center text-slate-400 text-sm">
                            <div className="flex items-center gap-1">
                                <Calendar size={14} /> {car.year}
                            </div>
                            <div className="flex items-center gap-1 text-green-400 font-mono font-bold">
                                <DollarSign size={14} /> {car.price.toLocaleString()}
                            </div>
                        </div>
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