import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CloudRain } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email,
        password
      });

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Login falhou. Verifique suas credenciais.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-slate-800 rounded-full">
            <CloudRain size={48} className="text-blue-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-white mb-2">Bem-vindo ao SkyMind</h1>
        <p className="text-slate-400 text-center mb-8">Faça login para acessar o monitoramento</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}