import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserPlus, 
  Shield, 
  MoreVertical, 
  Search,
  Loader2
} from 'lucide-react';

const Users = () => {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await axios.get('/api/crm?type=team');
        setTeam(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestion de l'Équipe</h1>
          <p className="text-slate-400">Gérez les accès et les rôles de vos collaborateurs.</p>
        </div>
        <button className="btn-primary">
          <UserPlus size={18} />
          Nouvel Utilisateur
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6">
          <p className="text-slate-500 text-sm mb-1">Membres Actifs</p>
          <h3 className="text-3xl font-bold">12</h3>
        </div>
        <div className="glass-card p-6">
          <p className="text-slate-500 text-sm mb-1">Rôles Définis</p>
          <h3 className="text-3xl font-bold">4</h3>
        </div>
        <div className="glass-card p-6">
          <p className="text-slate-500 text-sm mb-1">Dernière Connexion</p>
          <h3 className="text-3xl font-bold text-success">Maintenant</h3>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="text" placeholder="Rechercher un membre..." className="pl-12 w-full max-w-md" />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white/5 rounded-xl text-sm font-bold border border-white/10">Tous</button>
            <button className="px-4 py-2 hover:bg-white/5 rounded-xl text-sm font-bold text-slate-500">Admins</button>
            <button className="px-4 py-2 hover:bg-white/5 rounded-xl text-sm font-bold text-slate-500">Média</button>
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Utilisateur</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Rôle</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Statut</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Dernière Activité</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <Loader2 size={32} className="animate-spin mx-auto text-primary mb-2" />
                  <p className="text-slate-500 text-sm">Chargement de l'équipe...</p>
                </td>
              </tr>
            ) : team.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">Aucun membre trouvé.</td></tr>
            ) : team.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl grad-bg flex items-center justify-center font-bold">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield size={14} className="text-[#8a3fff]" />
                    {user.role}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm">
                    {user.status === 'Online' ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-success"></div>
                        <span className="text-success">En ligne</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                        <span className="text-slate-500">Hors ligne</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                   {user.last_active ? new Date(user.last_active).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-white/10 rounded-lg text-slate-500">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
