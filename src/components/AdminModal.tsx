import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, RotateCcw, Save, FileText, Image as ImageIcon, Sparkles, Check, Download } from 'lucide-react';
import { Project } from '../types';
import { getCustomProjects, saveCustomProjects, resetCustomProjects, downloadProjectsJson } from '../data/projectsStorage';
import { useLanguage } from '../context/LanguageContext';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const { lang } = useLanguage();
  const [data, setData] = useState(() => getCustomProjects());
  const [activeTab, setActiveTab] = useState<'fr' | 'en'>(lang);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const currentList = data[activeTab];
  const activeEditingProject = currentList.find((p) => p.id === editingProjectId) || currentList[0] || null;

  const handleUpdateProjectField = (field: keyof Project, value: any) => {
    if (!activeEditingProject) return;
    const updated = currentList.map((p) => {
      if (p.id === activeEditingProject.id) {
        return { ...p, [field]: value };
      }
      return p;
    });
    setData({
      ...data,
      [activeTab]: updated,
    });
  };

  const handleAddNewProject = () => {
    const newId = `project-${Date.now()}`;
    const newProject: Project = {
      id: newId,
      number: `0${currentList.length + 1}`,
      title: activeTab === 'fr' ? 'Nouveau projet' : 'New Project',
      subtitle: activeTab === 'fr' ? 'Catégorie · Rôle' : 'Category · Role',
      client: activeTab === 'fr' ? 'Client / Entreprise' : 'Client / Company',
      year: new Date().getFullYear().toString(),
      category: 'Design & Web',
      role: 'Lead Designer',
      summary: activeTab === 'fr' ? 'Courte synthèse du projet...' : 'Brief summary of the project...',
      overview: activeTab === 'fr' ? 'Description détaillée de la réalisation, des objectifs et des livrables.' : 'Detailed description of the deliverables and outcome.',
      imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1200&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1200&auto=format&fit=crop'],
      metrics: [
        { label: 'Rôle', value: 'Création' },
        { label: 'Format', value: 'Digital' },
      ],
      stack: ['Figma', 'Web', 'Stratégie'],
      pdfUrl: '',
      pdfTitle: '',
    };

    // Also mirror to the other language so it exists in both
    const otherLang = activeTab === 'fr' ? 'en' : 'fr';
    const mirrorProject: Project = {
      ...newProject,
      title: otherLang === 'fr' ? 'Nouveau projet' : 'New Project',
      subtitle: otherLang === 'fr' ? 'Catégorie · Rôle' : 'Category · Role',
    };

    setData({
      fr: activeTab === 'fr' ? [...data.fr, newProject] : [...data.fr, mirrorProject],
      en: activeTab === 'en' ? [...data.en, newProject] : [...data.en, mirrorProject],
    });
    setEditingProjectId(newId);
  };

  const handleDeleteProject = (id: string) => {
    if (!confirm(activeTab === 'fr' ? 'Supprimer ce projet ?' : 'Delete this project?')) return;
    const updated = currentList.filter((p) => p.id !== id);
    setData({
      ...data,
      [activeTab]: updated,
    });
    if (editingProjectId === id) {
      setEditingProjectId(updated[0]?.id || null);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [filePersistedNotice, setFilePersistedNotice] = useState<string | null>(null);

  const handleSaveAll = async () => {
    setIsSaving(true);
    const fileSaved = await saveCustomProjects(data);
    setIsSaving(false);
    setSaveSuccess(true);
    if (fileSaved) {
      setFilePersistedNotice('Projets enregistrés dans src/data/projectsData.json (prêts pour git commit/push) !');
    } else {
      setFilePersistedNotice('Modifications enregistrées !');
    }
    setTimeout(() => {
      setSaveSuccess(false);
      setFilePersistedNotice(null);
      onClose();
    }, 1200);
  };

  const handleResetToDefault = () => {
    if (confirm(activeTab === 'fr' ? 'Réinitialiser tous les projets aux valeurs par défaut ?' : 'Reset all projects to defaults?')) {
      resetCustomProjects();
      setData(getCustomProjects());
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#111114] border border-white/20 rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#16161A]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#CCFF00] text-black flex items-center justify-center font-black text-sm">
                ✦
              </div>
              <div>
                <h3 className="font-syne font-bold text-base sm:text-lg text-white">
                  Éditeur de projets & contenus
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  Gérez vos projets, visuels et documents PDF directement dans votre navigateur
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switch */}
              <div className="flex items-center p-1 rounded-full bg-white/[0.06] border border-white/15 text-xs font-bold mr-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('fr')}
                  className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                    activeTab === 'fr' ? 'bg-[#CCFF00] text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  FR
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                    activeTab === 'en' ? 'bg-[#CCFF00] text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/[0.05] hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body: Split Layout (Projects List on Left, Editor Form on Right) */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
            {/* Left Sidebar: List of Projects */}
            <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/10 p-4 bg-[#141418] flex flex-col gap-2 overflow-y-auto max-h-[35vh] md:max-h-none shrink-0">
              <div className="flex items-center justify-between pb-2 mb-1 border-b border-white/10">
                <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
                  Projets ({currentList.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddNewProject}
                  className="h-7 px-2.5 rounded-full bg-white text-black hover:bg-[#CCFF00] text-xs font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Ajouter</span>
                </button>
              </div>

              {currentList.map((p) => {
                const isSelected = activeEditingProject?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setEditingProjectId(p.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-white/10 border-[#CCFF00]/50 text-white'
                        : 'bg-white/[0.02] border-white/5 text-[#A1A1AA] hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#CCFF00]">{p.number || '•'}</div>
                      <div className="text-sm font-bold text-white truncate">{p.title || 'Sans titre'}</div>
                      <div className="text-[11px] truncate opacity-60">{p.category || 'Catégorie'}</div>
                    </div>
                    {p.pdfUrl && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#CCFF00]/20 text-[#CCFF00] font-bold">
                        PDF
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Panel: Form Fields */}
            {activeEditingProject ? (
              <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#0E0E12]">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-syne text-[#CCFF00] uppercase font-bold tracking-wider">
                      Édition · {activeEditingProject.number}
                    </span>
                    <h4 className="text-xl font-bold text-white font-syne">
                      {activeEditingProject.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(activeEditingProject.id)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Supprimer</span>
                  </button>
                </div>

                {/* Main Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#A1A1AA] mb-1.5">
                      Titre du projet
                    </label>
                    <input
                      type="text"
                      value={activeEditingProject.title}
                      onChange={(e) => handleUpdateProjectField('title', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-sm focus:outline-hidden focus:border-[#CCFF00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#A1A1AA] mb-1.5">
                      Sous-titre / Catégorie affichée
                    </label>
                    <input
                      type="text"
                      value={activeEditingProject.subtitle}
                      onChange={(e) => handleUpdateProjectField('subtitle', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-sm focus:outline-hidden focus:border-[#CCFF00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#A1A1AA] mb-1.5">
                      Client / Contexte
                    </label>
                    <input
                      type="text"
                      value={activeEditingProject.client}
                      onChange={(e) => handleUpdateProjectField('client', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-sm focus:outline-hidden focus:border-[#CCFF00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#A1A1AA] mb-1.5">
                      Année
                    </label>
                    <input
                      type="text"
                      value={activeEditingProject.year}
                      onChange={(e) => handleUpdateProjectField('year', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-sm focus:outline-hidden focus:border-[#CCFF00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#A1A1AA] mb-1.5">
                      Rôle exercé
                    </label>
                    <input
                      type="text"
                      value={activeEditingProject.role}
                      onChange={(e) => handleUpdateProjectField('role', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-sm focus:outline-hidden focus:border-[#CCFF00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#A1A1AA] mb-1.5">
                      Numéro (ex: 01, 02)
                    </label>
                    <input
                      type="text"
                      value={activeEditingProject.number}
                      onChange={(e) => handleUpdateProjectField('number', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-sm focus:outline-hidden focus:border-[#CCFF00]"
                    />
                  </div>
                </div>

                {/* Summaries */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#A1A1AA] mb-1.5">
                      Résumé court (affiché sur la carte)
                    </label>
                    <textarea
                      rows={2}
                      value={activeEditingProject.summary}
                      onChange={(e) => handleUpdateProjectField('summary', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-sm focus:outline-hidden focus:border-[#CCFF00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#A1A1AA] mb-1.5">
                      Présentation détaillée (affichée dans la modale)
                    </label>
                    <textarea
                      rows={3}
                      value={activeEditingProject.overview}
                      onChange={(e) => handleUpdateProjectField('overview', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-sm focus:outline-hidden focus:border-[#CCFF00]"
                    />
                  </div>
                </div>

                {/* Image and PDF Section */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <ImageIcon className="w-4 h-4 text-[#CCFF00]" />
                    <span>Visuels & Images</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#A1A1AA] mb-1.5">
                      URL de l'image principale (couverture)
                    </label>
                    <input
                      type="text"
                      placeholder="https://... ou chemin local"
                      value={activeEditingProject.imageUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleUpdateProjectField('imageUrl', val);
                        if (!activeEditingProject.images || activeEditingProject.images.length <= 1) {
                          handleUpdateProjectField('images', [val]);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-sm focus:outline-hidden focus:border-[#CCFF00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#A1A1AA] mb-1.5">
                      Images secondaires pour la galerie (séparées par une virgule)
                    </label>
                    <input
                      type="text"
                      placeholder="https://image1.jpg, https://image2.jpg"
                      value={(activeEditingProject.images || []).join(', ')}
                      onChange={(e) => {
                        const split = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                        handleUpdateProjectField('images', split);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-sm focus:outline-hidden focus:border-[#CCFF00]"
                    />
                  </div>
                </div>

                {/* PDF Document Section */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <FileText className="w-4 h-4 text-[#CCFF00]" />
                    <span>Document PDF (Rapport, Présentation, Dossier)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-[#A1A1AA] mb-1.5">
                        Titre du PDF (ex: Présentation client, Rapport d'audit)
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Rapport complet du projet.pdf"
                        value={activeEditingProject.pdfTitle || ''}
                        onChange={(e) => handleUpdateProjectField('pdfTitle', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-sm focus:outline-hidden focus:border-[#CCFF00]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-[#A1A1AA] mb-1.5">
                        Lien ou URL du fichier PDF
                      </label>
                      <input
                        type="text"
                        placeholder="https://monsite.ch/mon-rapport.pdf ou lien cloud"
                        value={activeEditingProject.pdfUrl || ''}
                        onChange={(e) => handleUpdateProjectField('pdfUrl', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-sm focus:outline-hidden focus:border-[#CCFF00]"
                      />
                    </div>
                  </div>
                </div>

                {/* Tags / Stack */}
                <div>
                  <label className="block text-xs font-bold uppercase text-[#A1A1AA] mb-1.5">
                    Compétences & Outils (séparés par une virgule)
                  </label>
                  <input
                    type="text"
                    value={activeEditingProject.stack.join(', ')}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                      handleUpdateProjectField('stack', tags);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-sm focus:outline-hidden focus:border-[#CCFF00]"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-[#A1A1AA]">
                Sélectionnez un projet à modifier ou créez-en un nouveau.
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-[#16161A]">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-xs font-bold text-[#A1A1AA] hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser</span>
              </button>

              <button
                type="button"
                onClick={() => downloadProjectsJson(data)}
                className="text-xs font-bold text-[#A1A1AA] hover:text-[#CCFF00] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Télécharger une copie du fichier JSON (projectsData.json)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger JSON</span>
              </button>
            </div>

            {filePersistedNotice && (
              <div className="text-xs text-[#CCFF00] font-sans font-medium text-center sm:text-left truncate max-w-xs">
                {filePersistedNotice}
              </div>
            )}

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-white/20 text-white hover:bg-white/10 text-xs font-syne font-bold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveAll}
                className="px-6 py-2 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] disabled:opacity-50 text-black text-xs font-syne font-bold inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Enregistré dans le projet !</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
