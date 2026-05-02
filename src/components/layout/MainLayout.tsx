import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserPlus, 
  LogOut, 
  Search, 
  Bell,
  Briefcase,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../../assets/logo.png';

const MainLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Tableau de Bord' },
    { path: '/new-lead', icon: UserPlus, label: 'Nouveau Lead' },
    { path: '/projects', icon: Briefcase, label: 'Projets' },
    { path: '/team', icon: Users, label: 'Équipe' },
  ];

  return (
    <div className="flex min-h-screen bg-[#02040a] text-white">
      {/* Sidebar */}
      <aside className="w-72 glass-panel m-4 mr-0 flex flex-col p-6 sticky top-4 h-[calc(100vh-2rem)] z-50 overflow-hidden">
        <div className="flex items-center gap-3 mb-12 px-2">
          <motion.img 
            src={logo} 
            alt="Logo" 
            className="w-10 h-10 object-contain"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <span className="font-bold text-xl grad-text">SAMOTECH CRM</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#8a3fff]/20 to-transparent border-l-4 border-[#8a3fff] text-white shadow-[0_0_20px_rgba(138,63,255,0.1)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#8a3fff]' : ''} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="bg-gradient-to-br from-white/5 to-transparent p-4 rounded-2xl mb-4 border border-white/5">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Statut Cloud</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Connecté à Neon Cloud</span>
            </div>
          </div>
          
          <button className="flex items-center gap-4 px-4 py-3 w-full text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-8 glass-panel px-8 py-4 sticky top-0 z-40 bg-[#02040a]/80 backdrop-blur-xl">
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10 w-96">
            <Search size={18} className="text-slate-500" />
            <input 
              type="text" 
              placeholder="Rechercher un client, projet..." 
              className="bg-transparent border-none p-0 text-sm w-full focus:ring-0 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#8a3fff] rounded-full border-2 border-[#02040a]"></span>
            </button>
            
            <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-white">Admin Samotech</p>
                <p className="text-xs text-[#8a3fff]">Directeur d'Agence</p>
              </div>
              <div className="w-10 h-10 rounded-full grad-bg flex items-center justify-center font-bold text-white border-2 border-white/20 shadow-lg shadow-primary/20">
                AS
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="pb-12"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default MainLayout;
