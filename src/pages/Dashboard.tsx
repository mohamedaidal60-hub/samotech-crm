import { 
  Users, 
  Film, 
  Code, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, projectsRes] = await Promise.all([
          axios.get('/api/crm?type=leads'),
          axios.get('/api/crm?type=projects')
        ]);
        setLeads(leadsRes.data);
        setProjects(projectsRes.data);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Leads Totaux', value: leads.length.toString(), icon: Users, color: '#8a3fff', trend: '+12%' },
    { label: 'Projets Média', value: projects.filter(p => p.type === 'media').length.toString(), icon: Film, color: '#00f2ff', trend: '+5%' },
    { label: 'Projets Dev', value: projects.filter(p => p.type === 'dev').length.toString(), icon: Code, color: '#10b981', trend: '+8%' },
    { label: 'En Cours', value: projects.filter(p => p.status !== 'done').length.toString(), icon: Clock, color: '#f59e0b', trend: 'Steady' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon size={64} style={{ color: stat.color }} />
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
                  <Icon size={24} style={{ color: stat.color }} />
                </div>
                <span className="text-sm font-medium text-slate-400">{stat.label}</span>
              </div>
              
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold">{stat.value}</h3>
                <div className="flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-full">
                  <TrendingUp size={12} />
                  {stat.trend}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-2 mb-2">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Layers className="text-[#8a3fff]" />
              Projets Récents
            </h2>
            <button className="text-sm text-[#8a3fff] hover:underline font-medium whitespace-nowrap">Voir tout</button>
          </div>

          <div className="glass-panel overflow-hidden border-white/5">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Progression</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Chargement des données...</td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">Aucun projet trouvé. Créez un nouveau lead !</td>
                  </tr>
                ) : projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-xs font-bold border border-white/10">
                          {proj.name[0]}
                        </div>
                        <span className="font-semibold">{proj.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                        proj.type === 'media' ? 'bg-[#8a3fff]/10 text-[#8a3fff]' : 'bg-[#00f2ff]/10 text-[#00f2ff]'
                      }`}>
                        {proj.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-warning" />
                        Étape {proj.current_step}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(proj.current_step / 6) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="grad-bg h-full rounded-full"
                        ></motion.div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/project/${proj.id}`} className="p-2 hover:bg-white/10 rounded-lg transition-colors inline-block">
                        <ArrowUpRight size={18} className="text-slate-500" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Activity */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-3 px-2">
            <TrendingUp className="text-[#00f2ff]" />
            Activité Média
          </h2>
          
          <div className="glass-panel p-6 space-y-2">
            {[
              { user: 'Sami', action: 'a terminé le script UGC', target: 'Pack Samotech v2', time: 'Il y a 10 min' },
              { user: 'Amine', action: 'a uploadé une voix off', target: 'Creative Video v1', time: 'Il y a 45 min' },
              { user: 'Yanis', action: 'a validé le shooting', target: 'Branding Pack', time: 'Il y a 2h' },
            ].map((activity, i) => (
              <div key={i} className="activity-item">
                {i !== 2 && <div className="avatar-line"></div>}
                <div className="w-8 h-8 rounded-full grad-bg flex-shrink-0 flex items-center justify-center text-[10px] font-bold z-10">
                  {activity.user[0]}
                </div>
                <div className="space-y-1">
                  <p className="text-sm leading-snug">
                    <span className="font-bold">{activity.user}</span> {activity.action} pour <span className="text-[#8a3fff] font-medium">{activity.target}</span>
                  </p>
                  <p className="text-[10px] text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
            
            <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition-all mt-4 flex items-center justify-center gap-2 group">
              Voir tout l'historique
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
