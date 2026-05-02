import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import logo from '../assets/logo.png';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#02040a] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-10 w-full max-w-md relative z-10 border-white/10"
      >
        <div className="text-center mb-10">
          <motion.img 
            src={logo} 
            alt="Logo" 
            className="w-20 h-20 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(138,63,255,0.5)]"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <h1 className="text-3xl font-bold mb-2">Bienvenue</h1>
          <p className="text-slate-400 text-sm">Connectez-vous à l'espace CRM Samotech</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Email Professionnel</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                required 
                className="pl-12" 
                placeholder="nom@samotech.dz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-slate-400">Mot de Passe</label>
              <button type="button" className="text-xs text-primary hover:underline">Oublié ?</button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                required 
                className="pl-12" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="w-full btn-primary py-4 mt-4 justify-center text-lg">
            Se Connecter
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Sparkles size={14} className="text-primary" />
          <span>Propulsé par SamoTech Intelligence</span>
        </div>
      </motion.div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-8 text-center w-full">
        <p className="text-[10px] text-slate-700 uppercase tracking-widest font-bold">Système Interne • Accès Réservé</p>
      </div>
    </div>
  );
};

export default Auth;
