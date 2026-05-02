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
  Loader2
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

  const mediaSteps = [
    { id: 1, label: 'Contact & Appel', icon: Clock },
    { id: 2, label: 'Scripting', icon: FileText },
    { id: 3, label: 'Voix Off', icon: Mic },
    { id: 4, label: 'Shooting', icon: Camera },
    { id: 5, label: 'Montage', icon: Video },
    { id: 6, label: 'Paiement', icon: CreditCard },
  ];

  const devSteps = [
    { id: 1, label: 'Besoins / CDC', icon: FileText },
    { id: 2, label: 'Design UI/UX', icon: PenTool },
    { id: 3, label: 'Base de Données', icon: Database },
    { id: 4, label: 'Développement', icon: Code2 },
    { id: 5, label: 'Déploiement', icon: CheckCircle2 },
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
      <div className="glass-panel p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl grad-bg flex items-center justify-center text-2xl font-bold border-2 border-white/20">
            {project.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                project.status === 'active' ? 'bg-[#8a3fff]/20 text-[#8a3fff] border-[#8a3fff]/30' : 'bg-success/20 text-success border-success/30'
              }`}>
                {project.status.toUpperCase()}
              </span>
            </div>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <span className="font-semibold text-white">ID:</span> #{project.id.slice(0, 8)}
            </p>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => setActiveTab('media')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'media' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            Workflow Média
          </button>
          <button 
            onClick={() => setActiveTab('dev')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'dev' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            Workflow Dev
          </button>
        </div>
      </div>

      {/* Workflow Progress Bar */}
      <div className="glass-panel p-8 relative overflow-hidden">
        <div className="flex justify-between relative z-10">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-3 relative flex-1">
                {/* Line */}
                {i < steps.length - 1 && (
                  <div className={`absolute top-5 left-1/2 w-full h-[2px] ${isCompleted ? 'bg-primary' : 'bg-white/10'}`}></div>
                )}
                
                <button 
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all relative z-10 ${
                    isCompleted ? 'bg-primary border-primary text-white' : 
                    isCurrent ? 'bg-bg-surface border-primary text-primary shadow-[0_0_15px_rgba(138,63,255,0.4)]' : 
                    'bg-white/5 border-white/10 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                </button>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-primary' : 'text-slate-500'}`}>
                  {step.label}
                </span>
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
            <>
              {/* Step 2: Scripting */}
              {currentStep === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="glass-panel p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <FileText className="text-[#8a3fff]" />
                      Scripting & Scénarios
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-400">Script Vidéo UGC / Créative</label>
                        <textarea 
                          rows={8} 
                          placeholder="Rédigez le script détaillé ici..."
                          className="bg-white/5 border-white/10"
                          defaultValue="[Accroche] : Salut tout le monde, aujourd'hui je vous présente Aroma Verse...\n[Corps] : Ce parfum est juste incroyable, j'adore les notes de fond...\n[Call to Action] : Cliquez sur le lien pour commander !"
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-400">Type de Script</label>
                          <select className="bg-white/5 border-white/10">
                            <option>Vidéo UGC</option>
                            <option>Publicité Meta</option>
                            <option>Spot Publicitaire</option>
                            <option>Scénario Court-métrage</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-400">Ton du message</label>
                          <select className="bg-white/5 border-white/10">
                            <option>Energique / Enthousiaste</option>
                            <option>Professionnel / Sobre</option>
                            <option>Luxe / Premium</option>
                            <option>Humoristique</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Voix Off */}
              {currentStep === 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="glass-panel p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <Mic className="text-[#00f2ff]" />
                      Voix Off & Enregistrement
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-6 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-all group">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Upload size={32} />
                        </div>
                        <div className="text-center">
                          <p className="font-bold">Uploader le fichier audio</p>
                          <p className="text-xs text-slate-500">MP3, WAV (Max 50MB)</p>
                        </div>
                        <button className="btn-secondary py-2 px-6 text-sm">Choisir un fichier</button>
                      </div>

                      <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 flex flex-col items-center justify-center gap-4">
                        <div className={`w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 ${isRecording ? 'animate-ping' : ''}`}>
                          <Mic size={32} />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-red-400">{isRecording ? 'Enregistrement en cours...' : 'Enregistrement Direct'}</p>
                          <p className="text-xs text-slate-500">{isRecording ? 'Parlez maintenant' : 'Enregistrez via votre micro'}</p>
                        </div>
                        <button 
                          onClick={isRecording ? stopRecording : startRecording}
                          disabled={saving && !isRecording}
                          className={`px-6 py-2 rounded-xl text-white text-sm font-bold shadow-lg transition-transform hover:scale-105 ${
                            isRecording ? 'bg-slate-700' : 'bg-red-500 shadow-red-500/20'
                          }`}
                        >
                          {isRecording ? 'Arrêter' : 'Lancer l\'enregistrement'}
                        </button>
                      </div>
                    </div>

                    <div className="mt-8 space-y-4">
                      <p className="text-sm font-bold text-slate-400">Fichiers enregistrés</p>
                      
                      {voiceovers.length === 0 && <p className="text-xs text-slate-600 italic">Aucun enregistrement pour le moment.</p>}
                      
                      {voiceovers.map((vo) => (
                        <div key={vo.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 group">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => window.open(vo.file_url, '_blank')}
                              className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary hover:bg-primary/30 transition-all"
                            >
                              <Play size={18} fill="currentColor" />
                            </button>
                            <div>
                              <p className="text-sm font-bold">{vo.filename}</p>
                              <p className="text-[10px] text-slate-500">{new Date(vo.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href={vo.file_url} download className="p-2 hover:bg-white/10 rounded-lg text-slate-400">
                              <Upload size={16} className="rotate-180" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Other steps simplified for demonstration */}
              {(currentStep === 4 || currentStep === 5) && (
                <div className="glass-panel p-8 text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                    {currentStep === 4 ? <Camera size={40} className="text-primary" /> : <Video size={40} className="text-primary" />}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{currentStep === 4 ? 'Shooting en cours' : 'Montage en cours'}</h3>
                  <p className="text-slate-400 max-w-md mx-auto">Cette étape est gérée par l'équipe de production. Les fichiers seront disponibles bientôt.</p>
                </div>
              )}
            </>
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
