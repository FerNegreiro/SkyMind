import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Wind, Droplets, Thermometer, Activity, BrainCircuit, Download, LogOut, AlertTriangle, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface WeatherLog {
  temperature: number;
  humidity: number;
  windSpeed: number;
  createdAt: string;
  time?: string;
}

export function Dashboard() {
  const [data, setData] = useState<WeatherLog[]>([]);
  const [insight, setInsight] = useState<string>("Analisando dados...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/');
  }, [navigate]);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      handleLogout();
      return;
    }

    try {
      const response = await axios.get('http://localhost:3000/weather', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const rawLogs = response.data.logs || []; 
      const aiMessage = response.data.insight || "Sem dados suficientes.";

      const formattedData = rawLogs.reverse().map((item: any) => ({
        ...item,
        time: new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }));
      
      setData(formattedData);
      setInsight(aiMessage);
      setError(null);
    } catch (err: any) {
      console.error("Erro API:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        handleLogout();
      } else {
        setError("Falha ao conectar com o servidor. Verifique se o Backend está online.");
      }
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleDownload = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:3000/weather/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'relatorio_clima.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro no download", error);
      alert("Erro ao baixar arquivo.");
    }
  };

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-blue-500 animate-pulse text-xl font-bold flex items-center gap-2">
          <Activity className="animate-spin" /> Carregando SkyMind...
        </div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200 gap-4 p-4 text-center">
        <AlertTriangle size={48} className="text-red-500 mb-2" />
        <h2 className="text-2xl font-bold">Ops! Algo deu errado.</h2>
        <p className="text-slate-400 max-w-md">{error}</p>
        <button 
          onClick={handleLogout} 
          className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
        >
          Voltar para Login
        </button>
      </div>
    );
  }

  const current = data[data.length - 1] || { temperature: 0, humidity: 0, windSpeed: 0, time: '--:--' };

  return (
    <div className="min-h-screen p-8 font-sans bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-center md:items-end border-b border-slate-800 pb-6 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">SkyMind AI</h1>
            <p className="text-slate-400 mt-2 flex items-center justify-center md:justify-start gap-2">
              <Activity size={16} className="text-green-400" /> Monitoramento Real-Time
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate('/explorar')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors border border-indigo-500 text-sm font-medium shadow-lg shadow-indigo-500/20">
              <Globe size={16} /> Explorar API
            </button>
            <button onClick={handleDownload} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg transition-colors border border-slate-700 text-sm font-medium">
              <Download size={16} /> <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 px-4 py-2 rounded-lg transition-colors border border-red-900/50 text-sm font-medium">
              <LogOut size={16} /> Sair
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg flex items-center gap-3 text-red-200">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-6 rounded-2xl border border-indigo-700 shadow-lg flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 bg-indigo-600 rounded-full animate-pulse"><BrainCircuit size={32} className="text-white" /></div>
            <div className="text-center md:text-left">
                <h3 className="text-indigo-300 font-bold text-sm uppercase tracking-wide mb-1">Análise de IA</h3>
                <p className="text-xl text-white font-medium">{insight}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card icon={<Thermometer size={32} className="text-orange-500" />} title="Temperatura" value={`${current.temperature}°C`} />
          <Card icon={<Droplets size={32} className="text-blue-500" />} title="Umidade" value={`${current.humidity}%`} />
          <Card icon={<Wind size={32} className="text-emerald-500" />} title="Vento" value={`${current.windSpeed} km/h`} />
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 h-[350px] shadow-xl">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
              <YAxis domain={['auto', 'auto']} stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
              <Area type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={3} fill="url(#colorTemp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, value }: any) {
  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center gap-4 hover:border-slate-600 transition-colors shadow-md">
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">{icon}</div>
      <div><p className="text-slate-400 text-sm">{title}</p><p className="text-3xl font-bold text-slate-100">{value}</p></div>
    </div>
  );
}