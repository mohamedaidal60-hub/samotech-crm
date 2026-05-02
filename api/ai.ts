
export default async function handler(req: any, res: any) {
  const { method, body } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  const { projectType, clientName, activities, tone } = body;

  // Mock AI Script Generation
  const scripts: Record<string, string> = {
    'ugc': `[SCÈNE 1 - INTÉRIEUR JOUR]\n(L'interlocuteur tient son téléphone à bout de bras, style selfie)\n"Salut tout le monde ! Aujourd'hui je voulais vous parler d'un truc de dingue que j'ai découvert chez ${clientName || 'SamoTech'}. "\n\n[SCÈNE 2]\n(Démonstration produit/service)\n"Regardez-moi cette fluidité. C'est exactement ce qu'il nous fallait pour booster notre visibilité."\n\n[SCÈNE 3 - CONCLUSION]\n"Si vous aussi vous voulez passer au niveau supérieur, foncez voir leur pack ${activities?.[0] || 'Premium'}. Vous ne le regretterez pas !"`,
    'ads': `[VOIX OFF]\n"Le marché évolue. Et vous ?"\n\n[TEXTE À L'ÉCRAN]\nInnovation. Performance. Résultat.\n\n[VISUEL]\nMontage dynamique de ${clientName || 'votre marque'} en action.\n\n[APPEL À L'ACTION]\n"SamoTech : L'excellence digitale à portée de main. Contactez-nous pour votre Pack Sur Mesure."`,
    'branding': `CONCEPT CRÉATIF : ${clientName || 'Expansion'}\n\n1. Palette de couleurs : Bleu Électrique (#00f2ff) et Violet Profond (#8a3fff).\n2. Typographie : Modern Sans-Serif (Outfit/Inter).\n3. Valeurs : Rapidité, Fiabilité, Futurisme.\n\nMESSAGE CLÉ : "Donner vie à votre vision digitale."`,
    'dev': `CAHIER DES CHARGES TECHNIQUE\n\n- Stack : React 19 + Vite + Tailwind 4\n- Backend : Vercel Serverless + Neon DB\n- Fonctions clés : Authentification, Dashboard Temps Réel, Media Hub.\n- Hébergement : Vercel Cloud.`
  };

  const selectedType = projectType?.toLowerCase().includes('ugc') ? 'ugc' : 
                       projectType?.toLowerCase().includes('ads') ? 'ads' : 
                       projectType?.toLowerCase().includes('branding') ? 'branding' : 'dev';

  const script = scripts[selectedType] || scripts['dev'];

  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  return res.status(200).json({ script });
}
