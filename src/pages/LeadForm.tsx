import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Building2, 
  Phone, 
  ChevronDown, 
  X, 
  Sparkles,
  Save,
  Check,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LeadForm = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company: '',
    phone: ''
  });
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name) return alert("Veuillez remplir les champs obligatoires");
    setLoading(true);
    try {
      await axios.post('/api/crm', {
        type: 'new-lead',
        data: { ...formData, activities: selectedActivities }
      });
      alert("Lead créé avec succès !");
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création du lead");
    } finally {
      setLoading(false);
    }
  };

  const activities = [
    { id: 'ugc', label: 'Vidéos UGC', category: 'Média' },
    { id: 'creative', label: 'Vidéos Créatives', category: 'Média' },
    { id: 'pack-samotech', label: 'Pack Samotech', category: 'Média' },
    { id: 'branding', label: 'Branding', category: 'Média' },
    { id: 'ads', label: 'Gestion Publicitaire (Ads)', category: 'Média' },
    { id: 'social', label: 'Community Management', category: 'Média' },
    { id: 'web-showcase', label: 'Site Vitrine', category: 'Dev' },
    { id: 'web-ecommerce', label: 'E-commerce', category: 'Dev' },
    { id: 'saas', label: 'Plateforme SaaS', category: 'Dev' },
    { id: 'mobile', label: 'App Mobile', category: 'Dev' },
    { id: 'automation', label: 'Automatisation', category: 'Dev' },
  ];

  const toggleActivity = (id: string) => {
    if (selectedActivities.includes(id)) {
      setSelectedActivities(selectedActivities.filter(a => a !== id));
    } else {
      setSelectedActivities([...selectedActivities, id]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Nouveau Client</h1>
          <p className="text-slate-400">Enregistrez un nouveau prospect et configurez son pack sur mesure.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn-secondary" onClick={() => navigate('/')}>Annuler</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {loading ? 'Enregistrement...' : 'Enregistrer le Lead'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-8 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/5 pb-4 mb-6">
              <User size={18} className="text-[#8a3fff]" />
              Informations de l'interlocuteur
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Prénom</label>
                <input 
                  type="text" 
                  placeholder="Ex: Ahmed" 
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Nom</label>
                <input 
                  type="text" 
                  placeholder="Ex: Belkacem" 
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Raison Sociale</label>
              <div className="relative">
                <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Nom de l'entreprise" 
                  className="pl-12" 
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Numéro de Téléphone</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="tel" 
                  placeholder="+213 --- -- -- --" 
                  className="pl-12" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Needs Multi-select */}
          <div className="glass-panel p-8 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/5 pb-4 mb-6">
              <Sparkles size={18} className="text-[#00f2ff]" />
              Besoins du Client (Pack sur mesure)
            </h3>

            <div className="relative">
              <label className="text-sm font-medium text-slate-400 mb-2 block">Activités souhaitées</label>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center hover:border-primary/50 transition-all"
              >
                <span className="text-slate-300">
                  {selectedActivities.length > 0 
                    ? `${selectedActivities.length} activités sélectionnées` 
                    : "Choisir les services..."}
                </span>
                <ChevronDown size={20} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 glass-panel border border-white/10 z-50 p-2 max-h-64 overflow-y-auto"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {activities.map((act) => {
                        const isSelected = selectedActivities.includes(act.id);
                        return (
                          <button
                            key={act.id}
                            onClick={() => toggleActivity(act.id)}
                            className={`flex items-center justify-between p-3 rounded-lg text-sm transition-all ${
                              isSelected ? 'bg-[#8a3fff]/20 text-white' : 'hover:bg-white/5 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                isSelected ? 'bg-[#8a3fff] border-[#8a3fff]' : 'border-slate-600'
                              }`}>
                                {isSelected && <Check size={12} />}
                              </div>
                              {act.label}
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-50">{act.category}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selected Tags */}
            <div className="flex flex-wrap gap-3 mt-4">
              {selectedActivities.map(id => {
                const act = activities.find(a => a.id === id);
                return (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={id}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#8a3fff]/20 to-[#00f2ff]/20 border border-white/10 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {act?.label}
                    <button onClick={() => toggleActivity(id)} className="hover:text-red-400">
                      <X size={14} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 sticky top-32">
            <h3 className="font-bold mb-4">Résumé du Pack</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-slate-500 mb-1">Interlocuteur</p>
                <p className="font-semibold text-sm">
                  {formData.first_name || formData.last_name 
                    ? `${formData.first_name} ${formData.last_name}` 
                    : "Préciser au-dessus"}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-slate-500 px-1 uppercase tracking-widest font-bold">Services</p>
                {selectedActivities.length === 0 && <p className="text-sm text-slate-600 italic px-1">Aucun service sélectionné</p>}
                {selectedActivities.slice(0, 4).map(id => (
                  <div key={id} className="flex items-center gap-2 text-sm px-1">
                    <div className="w-1.5 h-1.5 rounded-full grad-bg"></div>
                    {activities.find(a => a.id === id)?.label}
                  </div>
                ))}
                {selectedActivities.length > 4 && (
                  <p className="text-xs text-[#8a3fff] font-bold px-5">+{selectedActivities.length - 4} autres</p>
                )}
              </div>

              <div className="pt-4 border-t border-white/5 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-400">Estimation Initiale</span>
                  <span className="font-bold text-[#00f2ff]">-- DZD</span>
                </div>
                <p className="text-[10px] text-slate-600">Le montant exact sera défini après l'appel initial.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadForm;
