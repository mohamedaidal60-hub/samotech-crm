import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  Layers,
  Film,
  Code,
  CheckCircle2,
  Clock,
  MoreVertical,
  ArrowUpDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Projects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'media' | 'dev'>('all');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('/api/crm?type=projects');
        setProjects(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.type.toLowerCase() === filter);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tous les Projets</h1>
          <p className="text-slate-400">Gérez et suivez l'évolution de tous les contrats en cours.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-primary text-white' : 'text-slate-500'}`}
            >
              Tous
            </button>
            <button 
              onClick={() => setFilter('media')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'media' ? 'bg-primary text-white' : 'text-slate-500'}`}
            >
              Média
            </button>
            <button 
              onClick={() => setFilter('dev')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'dev' ? 'bg-primary text-white' : 'text-slate-500'}`}
            >
              Dev
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Rechercher par nom ou client..." className="pl-12 py-2 text-sm" />
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary py-2 px-4 text-xs flex items-center gap-2">
              <Filter size={14} />
              Filtres Avancés
            </button>
            <button className="btn-secondary py-2 px-4 text-xs flex items-center gap-2">
              <ArrowUpDown size={14} />
              Trier
            </button>
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/[0.01] text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-8 py-4">Projet & Client</th>
              <th className="px-8 py-4">Type</th>
              <th className="px-8 py-4">Dernière étape</th>
              <th className="px-8 py-4">Progression</th>
              <th className="px-8 py-4">Date Début</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-8 py-10 text-center text-slate-500">Chargement des projets...</td>
              </tr>
            ) : filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-10 text-center text-slate-500">Aucun projet trouvé.</td>
              </tr>
            ) : filteredProjects.map((proj) => (
              <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-5">
                  <Link to={`/project/${proj.id}`} className="block group-hover:translate-x-1 transition-transform">
                    <p className="font-bold text-white mb-0.5">{proj.name}</p>
                    <p className="text-xs text-slate-500">Projet #{proj.id.slice(0, 8)}</p>
                  </Link>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    {proj.type === 'media' ? (
                      <Film size={14} className="text-[#8a3fff]" />
                    ) : (
                      <Code size={14} className="text-[#00f2ff]" />
                    )}
                    <span className="text-xs font-medium uppercase">{proj.type}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-xs">
                    {proj.current_step === 6 ? (
                      <CheckCircle2 size={14} className="text-success" />
                    ) : (
                      <Clock size={14} className="text-warning" />
                    )}
                    Étape {proj.current_step}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-white/5 h-1.5 rounded-full min-w-[80px]">
                      <div 
                        className="grad-bg h-full rounded-full" 
                        style={{ width: `${(proj.current_step / 6) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{Math.round((proj.current_step / 6) * 100)}%</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-xs text-slate-500 font-medium">{new Date(proj.created_at).toLocaleDateString()}</td>
                <td className="px-8 py-5 text-right">
                  <Link to={`/project/${proj.id}`} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 inline-block">
                    <MoreVertical size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProjects.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <Layers size={48} className="mx-auto text-slate-700" />
            <p className="text-slate-500">Aucun projet ne correspond à vos critères.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
