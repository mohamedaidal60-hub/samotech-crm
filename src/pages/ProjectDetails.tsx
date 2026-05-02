import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, 
  Mic, 
  Camera, 
  Video, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Upload, 
  ChevronRight,
  Plus,
  Play,
  Save,
  Database,
  PenTool,
  Code2,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

import { supabase } from '../lib/supabase';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [voiceovers, setVoiceovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'media' | 'dev'>('media');
  const [currentStep, setCurrentStep] = useState(1);
  const [showFinance, setShowFinance] = useState(false);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, voRes] = await Promise.all([
          axios.get(`/api/crm?type=projects&id=${id}`),
          axios.get(`/api/crm?type=voiceovers&projectId=${id}`)
        ]);
        setProject(projRes.data);
        setVoiceovers(voRes.data);
        setActiveTab(projRes.data.type);
        setCurrentStep(projRes.data.current_step);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setAudioChunks([]);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) setAudioChunks((prev) => [...prev, e.data]);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await uploadAudio(audioBlob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Erreur micro: " + err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const uploadAudio = async (blob: Blob) => {
    setSaving(true);
    try {
      const fileName = `vo_${id}_${Date.now()}.wav`;
      
      // 1. Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('voiceovers')
        .upload(fileName, blob);

      if (error) throw error;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('voiceovers')
        .getPublicUrl(fileName);

      // 3. Save to Neon DB
      const res = await axios.post('/api/crm', {
        type: 'voiceover',
        data: {
          project_id: id,
          filename: fileName,
          file_url: publicUrl
        }
      });

      setVoiceovers([res.data, ...voiceovers]);
      alert("Voix off enregistrée !");
    } catch (err: any) {
      console.error(err);
      alert("Erreur upload: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/crm', {
        type: 'update-project',
        data: {
          id: project.id,
          current_step: currentStep,
          total_amount: project.total_amount,
          paid_amount: project.paid_amount
        }
      });
      alert("Projet sauvegardé !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const fileName = `${id}_${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('voiceovers').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('voiceovers').getPublicUrl(fileName);
      const res = await axios.post('/api/crm', {
        type: 'voiceover',
        data: { project_id: id, filename: file.name, file_url: publicUrl }
      });
      setVoiceovers([res.data, ...voiceovers]);
      alert("Fichier média uploadé !");
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const mediaSteps = [
    { id: 1, label: 'Appel Initial', icon: Phone },
    { id: 2, label: 'Scripting', icon: FileText },
    { id: 3, label: 'Voix Off', icon: Mic },
    { id: 4, label: 'Tournage', icon: Camera },
    { id: 5, label: 'Post-Prod', icon: Video },
    { id: 6, label: 'Livraison', icon: CheckCircle2 },
  ];

  const devSteps = [
    { id: 1, label: 'Cahier des Charges', icon: FileText },
    { id: 2, label: 'Design & UX', icon: PenTool },
    { id: 3, label: 'Base de Données', icon: Database },
    { id: 4, label: 'Développement', icon: Code2 },
    { id: 5, label: 'Livraison Finale', icon: CheckCircle2 },
  ];

  const steps = activeTab === 'media' ? mediaSteps : devSteps;

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 size={48} className="animate-spin text-primary" />
    </div>
  );

  if (!project) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Projet non trouvé</h2>
      <button onClick={() => navigate('/')} className="btn-primary">Retour au Dashboard</button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Project Header */}
      <div className="glass-panel p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full grad-bg"></div>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl grad-bg flex items-center justify-center text-3xl font-bold border-2 border-white/20 shadow-xl shadow-primary/20">
            {project.name[0]}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-lg ${
                project.status === 'active' ? 'bg-[#8a3fff]/20 text-[#8a3fff] border-[#8a3fff]/30' : 'bg-success/20 text-success border-success/30'
              }`}>
                {project.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 text-sm">
              <span className="flex items-center gap-1.5"><Building2 size={14} /> {project.company || 'Particulier'}</span>
              <span className="w-1 h-1 bg-white/20 rounded-full"></span>
              <span>ID: #{project.id.slice(0, 8)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveTab('media')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'media' ? 'bg-primary text-white shadow-[0_0_20px_rgba(138,63,255,0.4)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
          >
            Module Créatif
          </button>
          <button 
            onClick={() => setActiveTab('dev')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'dev' ? 'bg-secondary text-white shadow-[0_0_20px_rgba(0,242,255,0.4)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
          >
            Module Digital
          </button>
        </div>
      </div>

      {/* Progress Journey */}
      <div className="glass-panel p-10 relative overflow-hidden">
        <div className="relative flex justify-between items-center z-10 max-w-5xl mx-auto">
          {/* Progress Line Background */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-white/5 z-0" />
          {/* Active Progress Line */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            className="absolute top-6 left-0 h-1 grad-bg z-0 shadow-[0_0_15px_rgba(138,63,255,0.5)]"
          />
          
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-4 relative z-10">
                <button 
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 transform ${
                    isCompleted ? 'bg-primary border-primary text-white scale-90' : 
                    isCurrent ? 'bg-bg-surface border-primary text-primary scale-110 shadow-[0_0_25px_rgba(138,63,255,0.6)] rotate-3' : 
                    'bg-[#0a0e1a] border-white/10 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                </button>
                <div className="text-center">
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isCurrent ? 'text-primary' : isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
                    Étape {step.id}
                  </p>
                  <p className={`text-xs font-bold whitespace-nowrap ${isCurrent ? 'text-white' : 'text-slate-500'}`}>
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* MEDIA WORKFLOW CONTENT */}
          {activeTab === 'media' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Step Specific Content */}
              <div className="space-y-6">
                {currentStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <FileText className="text-primary" />
                      Rédaction du Script
                    </h3>
                    <textarea 
                      rows={12} 
                      className="bg-white/5 border-white/10"
                      placeholder="Tapez le script ici..."
                    ></textarea>
                    <div className="flex justify-between mt-4">
                      <button className="text-xs text-primary font-bold">Générer avec IA</button>
                      <button className="btn-primary py-2 px-4 text-xs">Sauvegarder Script</button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-8 text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-red-500">
                      <Mic size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Enregistrement Voix Off</h3>
                    <p className="text-sm text-slate-500 mb-6">Utilisez le module de droite pour enregistrer ou uploader la voix off finale.</p>
                  </motion.div>
                )}

                {currentStep >= 4 && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-8 text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                      <Camera size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Production Vidéo</h3>
                    <p className="text-sm text-slate-500">Étape en cours de traitement par l'équipe technique.</p>
                  </motion.div>
                )}
              </div>

              {/* Right Column: Persistent Media Hub (The WOW factor) */}
              <div className="glass-panel p-8 space-y-6 border-primary/20 bg-gradient-to-br from-[#0a0e1a] to-[#02040a]">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Layers size={18} className="text-secondary" />
                    Média Hub
                  </h3>
                  <div className="flex gap-2">
                    <div className="relative group">
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer w-10 z-20" 
                        onChange={handleFileUpload}
                      />
                      <button className="p-2 bg-white/5 rounded-xl border border-white/10 text-primary group-hover:bg-primary/10 transition-all">
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Recording Card */}
                  <div className={`p-6 rounded-2xl border transition-all ${isRecording ? 'bg-red-500/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-white/5 border-white/10 hover:border-red-500/30'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-red-500/10 text-red-500'}`}>
                        <Mic size={20} />
                      </div>
                      {isRecording && <span className="text-[10px] font-bold text-red-500 animate-pulse uppercase tracking-widest">Enregistrement...</span>}
                    </div>
                    <button 
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${isRecording ? 'bg-red-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                    >
                      {isRecording ? 'Arrêter et Sauvegarder' : 'Démarrer Voix Off Directe'}
                    </button>
                  </div>

                  {/* File List */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Fichiers du projet</p>
                    {voiceovers.length === 0 ? (
                      <div className="py-12 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                        <Upload size={24} className="mx-auto text-slate-700 mb-2" />
                        <p className="text-xs text-slate-600">Aucun média disponible</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {voiceovers.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                {file.filename.match(/\.(mp3|wav|ogg)$/i) ? <Mic size={18} /> : <Video size={18} />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold truncate w-24">{file.filename}</p>
                                <p className="text-[9px] text-slate-500">{new Date(file.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => window.open(file.file_url, '_blank')} className="p-2 hover:bg-primary/20 rounded-lg text-primary">
                                <Play size={14} fill="currentColor" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DEV WORKFLOW CONTENT */}
          {activeTab === 'dev' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               {/* Step 1: CDC */}
               {currentStep === 1 && (
                <div className="glass-panel p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <FileText className="text-[#8a3fff]" />
                    Cahier des Charges & Besoins
                  </h3>
                  <textarea 
                    rows={12} 
                    placeholder="Détaillez ici les besoins techniques, les fonctionnalités attendues et les contraintes..."
                    className="bg-white/5 border-white/10"
                  ></textarea>
                </div>
              )}

              {/* Step 3: DB & SQL */}
              {currentStep === 3 && (
                <div className="glass-panel p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Database className="text-[#00f2ff]" />
                    Architecture & SQL
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-black/40 rounded-xl border border-white/10 font-mono text-sm text-green-400">
                      <pre>
                        {`CREATE TABLE orders (\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n  client_name VARCHAR(255),\n  total_amount DECIMAL(10, 2),\n  status VARCHAR(50) DEFAULT 'pending'\n);`}
                      </pre>
                    </div>
                    <button className="btn-secondary w-full text-xs">Générer le Schéma SQL complet</button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Info & Payment Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="font-bold mb-4 flex justify-between items-center">
              Finance
              <button 
                onClick={() => setShowFinance(!showFinance)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                {showFinance ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </h3>
            
            <div className={`space-y-4 transition-all duration-500 ${showFinance ? 'opacity-100' : 'opacity-20 blur-md pointer-events-none'}`}>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
                <span className="text-xs text-slate-500">Montant Total (DZD)</span>
                <input 
                  type="number" 
                  className="bg-transparent border-none p-0 font-bold text-lg focus:ring-0"
                  value={project.total_amount}
                  onChange={(e) => setProject({...project, total_amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div className="p-4 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 flex flex-col gap-1">
                <span className="text-xs text-[#10b981]">Payé (DZD)</span>
                <input 
                  type="number" 
                  className="bg-transparent border-none p-0 font-bold text-[#10b981] focus:ring-0"
                  value={project.paid_amount}
                  onChange={(e) => setProject({...project, paid_amount: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex justify-between items-center">
                <span className="text-xs text-red-500">Reste à payer</span>
                <span className="font-bold text-red-500">{(project.total_amount - project.paid_amount).toLocaleString()} DZD</span>
              </div>

              <div className="pt-4 flex gap-2">
                <button className="flex-1 btn-primary py-2 text-xs">Ajouter Paiement</button>
                <button className="p-2 glass-card rounded-xl border-white/10"><Plus size={16} /></button>
              </div>
            </div>
            
            {!showFinance && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <Lock size={24} className="text-slate-600" />
                <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">Accès Restreint</p>
                <button 
                  onClick={() => setShowFinance(true)}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  Déverrouiller
                </button>
              </div>
            )}
          </div>

          <div className="glass-panel p-6">
            <h3 className="font-bold mb-4">Membres Assignés</h3>
            <div className="space-y-3">
              {[
                { name: 'Sami B.', role: 'Scriptwriter', color: '#8a3fff' },
                { name: 'Amine K.', role: 'Editor', color: '#00f2ff' },
                { name: 'Yanis T.', role: 'Project Manager', color: '#10b981' },
              ].map((member, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${member.color}20`, color: member.color }}>
                    {member.name.split(' ')[0][0]}{member.name.split(' ')[1][0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold">{member.name}</p>
                    <p className="text-[10px] text-slate-500">{member.role}</p>
                  </div>
                </div>
              ))}
              <button className="w-full mt-4 py-2 rounded-xl border border-dashed border-white/20 text-xs text-slate-500 hover:text-white hover:border-white/40 transition-all flex items-center justify-center gap-2">
                <Plus size={14} />
                Assigner un membre
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Bar Footer */}
      <div className="glass-panel p-4 sticky bottom-8 flex justify-between items-center border-primary/20 bg-[#02040a]/90 backdrop-blur-xl">
        <div className="flex gap-4">
          <button className="btn-secondary py-2 px-6">Précedent</button>
          <button className="btn-primary py-2 px-6">
            Étape Suivante
            <ChevronRight size={18} />
          </button>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 text-primary font-bold text-sm px-4 py-2 hover:bg-primary/10 rounded-xl transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
        </button>
      </div>
    </div>
  );
};

export default ProjectDetails;
