import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Search, 
  ExternalLink, 
  Mail, 
  Phone, 
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Clients = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/crm?type=leads');
        setLeads(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Base Clients</h1>
          <p className="text-slate-400">Gérez l'ensemble de vos contacts et leur historique.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/new-lead')}>
          <Plus size={18} />
          Nouveau Client
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="text" placeholder="Rechercher un client ou une entreprise..." className="pl-12 w-full max-w-md" />
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Entreprise</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">Chargement...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">Aucun client trouvé.</td></tr>
            ) : leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl grad-bg flex items-center justify-center font-bold">
                      {lead.first_name[0]}{lead.last_name[0]}
                    </div>
                    <div>
                      <p className="font-bold">{lead.first_name} {lead.last_name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Client Privé</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium">{lead.company || 'N/A'}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-xs flex items-center gap-2 text-slate-400">
                      <Phone size={12} className="text-primary" />
                      {lead.phone}
                    </p>
                    <p className="text-xs flex items-center gap-2 text-slate-400">
                      <Mail size={12} className="text-primary" />
                      {lead.email || 'Pas d\'email'}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-success/10 text-success border border-success/20 uppercase tracking-widest">
                    Actif
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all">
                    <ExternalLink size={18} />
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

export default Clients;
