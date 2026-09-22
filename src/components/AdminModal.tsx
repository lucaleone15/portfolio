import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Save, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  Download,
  Upload,
  FileUp,
  FolderOpen,
  Star,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
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
  const [isSaving, setIsSaving] = useState(false);
  const [filePersistedNotice, setFilePersistedNotice] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showFolderBrowser, setShowFolderBrowser] = useState(false);
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);
  const [availableImages, setAvailableImages] = useState<string[]>([
    '/images/DriveGear-01.png',
    '/images/HUG-01.png',
    '/images/KV-01.png',
    '/images/OceanSight-01.png',
  ]);
  const [availablePdfs, setAvailablePdfs] = useState<string[]>([
    '/pdf/OceanSight.pdf',
    '/pdf/ProjInt1_HUG.pdf',
    '/pdf/Repenser-la-communication-digitale-du-Karting-Vuiteboeuf.pdf',
  ]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Always sync with the latest storage / files when modal is opened
    setData(getCustomProjects());
    fetch('/api/media-files')
      .then((res) => res.json())
      .then((resData) => {
        if (Array.isArray(resData?.images) && resData.images.length > 0) {
          setAvailableImages(resData.images);
        }
        if (Array.isArray(resData?.pdfs) && resData.pdfs.length > 0) {
          setAvailablePdfs(resData.pdfs);
        }
      })
      .catch(() => {
        // Fallback default list
      });
  }, [isOpen]);

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

  const refreshMediaFiles = async () => {
    try {
      const res = await fetch('/api/media-files');
      const resData = await res.json();
      if (Array.isArray(resData?.images)) setAvailableImages(resData.images);
      if (Array.isArray(resData?.pdfs)) setAvailablePdfs(resData.pdfs);
    } catch {
      // Fallback
    }
  };

  const processImageFiles = (files: FileList | File[]) => {
    if (!files || files.length === 0 || !activeEditingProject) return;

    setIsUploading(true);
    const fileList: File[] = Array.from(files);

    fileList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch('/api/upload-media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              folder: 'images',
              filename: file.name,
              base64,
            }),
          });
          const uploadResult = await res.json();
          const uploadedUrl = uploadResult?.url || `/images/${file.name}`;

          const currentImgs = activeEditingProject.images || [];
          const nextImgs = currentImgs.includes(uploadedUrl) ? currentImgs : [...currentImgs, uploadedUrl];
          handleUpdateProjectField('images', nextImgs);
          if (!activeEditingProject.imageUrl) {
            handleUpdateProjectField('imageUrl', uploadedUrl);
          }
          setAvailableImages((prev) => (prev.includes(uploadedUrl) ? prev : [...prev, uploadedUrl]));
          setFilePersistedNotice(`✓ Image "${file.name}" ajoutée et automatiquement optimisée (1920px max, compression haute performance) !`);
          setTimeout(() => setFilePersistedNotice(null), 5000);
        } catch {
          const currentImgs = activeEditingProject.images || [];
          handleUpdateProjectField('images', [...currentImgs, base64]);
          if (!activeEditingProject.imageUrl) {
            handleUpdateProjectField('imageUrl', base64);
          }
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processImageFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handlePdfFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeEditingProject) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/upload-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            folder: 'pdf',
            filename: file.name,
            base64,
          }),
        });
        const uploadResult = await res.json();
        const uploadedUrl = uploadResult?.url || `/pdf/${file.name}`;
        handleUpdateProjectField('pdfUrl', uploadedUrl);
        if (!activeEditingProject.pdfTitle) {
          handleUpdateProjectField('pdfTitle', file.name.replace(/\.pdf$/i, ''));
        }
        setAvailablePdfs((prev) => (prev.includes(uploadedUrl) ? prev : [...prev, uploadedUrl]));
      } catch {
        handleUpdateProjectField('pdfUrl', base64);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const toggleImageInProject = (imgUrl: string) => {
    if (!activeEditingProject) return;
    const currentImgs = activeEditingProject.images || [];
    if (currentImgs.includes(imgUrl)) {
      const nextImgs = currentImgs.filter((img) => img !== imgUrl);
      handleUpdateProjectField('images', nextImgs);
      if (activeEditingProject.imageUrl === imgUrl) {
        handleUpdateProjectField('imageUrl', nextImgs[0] || '');
      }
    } else {
      const nextImgs = [...currentImgs, imgUrl];
      handleUpdateProjectField('images', nextImgs);
      if (!activeEditingProject.imageUrl) {
        handleUpdateProjectField('imageUrl', imgUrl);
      }
    }
  };

  const setCoverImage = (imgUrl: string) => {
    if (!activeEditingProject) return;
    handleUpdateProjectField('imageUrl', imgUrl);
    const currentImgs = activeEditingProject.images || [];
    if (!currentImgs.includes(imgUrl)) {
      handleUpdateProjectField('images', [imgUrl, ...currentImgs]);
    }
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

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-[#A1A1AA] mb-1.5">
                      Fait avec / Collaborateurs (optionnel)
                    </label>
                    <input
                      type="text"
                      placeholder="Marc Bridy, Romain Blanchard, Étienne Bergeon..."
                      value={activeEditingProject.team || ''}
                      onChange={(e) => handleUpdateProjectField('team', e.target.value)}
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

                {/* Image Section */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <ImageIcon className="w-4 h-4 text-[#CCFF00]" />
                      <span>Visuels & Images du projet</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
                        {(activeEditingProject.images || []).length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowFolderBrowser(!showFolderBrowser)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          showFolderBrowser
                            ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                            : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/15'
                        }`}
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Dossier /public/images</span>
                        {showFolderBrowser ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isUploading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#CCFF00] text-black hover:bg-[#b8e600] transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? 'Importation...' : 'Ajouter une image'}</span>
                      </button>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Drag-and-Drop Image Dropzone & Auto-optimizer badge */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(true);
                    }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        processImageFiles(e.dataTransfer.files);
                      }
                    }}
                    onClick={() => imageInputRef.current?.click()}
                    className={`relative p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center select-none ${
                      isDraggingOver
                        ? 'border-[#CCFF00] bg-[#CCFF00]/10 scale-[1.01]'
                        : 'border-white/15 hover:border-[#CCFF00]/50 hover:bg-white/[0.03] bg-black/20'
                    }`}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-[#CCFF00]">
                      <FileUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-white">
                        {isDraggingOver
                          ? 'Déposez vos images ici pour les optimiser automatiquement'
                          : 'Glissez-déposez vos images ici, ou cliquez pour parcourir'}
                      </p>
                      <p className="text-[11px] text-[#A1A1AA] mt-1 flex items-center justify-center gap-1.5 flex-wrap">
                        <Sparkles className="w-3 h-3 text-[#CCFF00]" />
                        <span>Optimisation automatique à l’envoi : redimensionnement (1920px max) & compression ultra-légère</span>
                      </p>
                    </div>
                  </div>
                  {showFolderBrowser && (
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                        <span className="font-semibold text-white/80">
                          Images détectées dans le répertoire <code className="text-[#CCFF00] bg-white/5 px-1.5 py-0.5 rounded">/public/images/</code> ({availableImages.length}) :
                        </span>
                        <button
                          type="button"
                          onClick={refreshMediaFiles}
                          className="hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" /> Rafraîchir
                        </button>
                      </div>

                      {availableImages.length === 0 ? (
                        <p className="text-xs text-white/50 italic py-2">Aucune image trouvée dans /public/images/</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-52 overflow-y-auto p-1">
                          {availableImages.map((imgPath) => {
                            const isIncluded = (activeEditingProject.images || []).includes(imgPath);
                            const isCover = activeEditingProject.imageUrl === imgPath;
                            const fileName = imgPath.split('/').pop();

                            return (
                              <div
                                key={imgPath}
                                onClick={() => toggleImageInProject(imgPath)}
                                className={`group relative rounded-xl border p-1.5 transition-all cursor-pointer flex flex-col items-center gap-1.5 text-center ${
                                  isIncluded
                                    ? 'bg-[#CCFF00]/10 border-[#CCFF00]/60 ring-1 ring-[#CCFF00]/40'
                                    : 'bg-white/[0.03] border-white/10 hover:border-white/25 hover:bg-white/[0.06]'
                                }`}
                              >
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/50">
                                  <img
                                    src={imgPath}
                                    alt={fileName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                  {isCover && (
                                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#CCFF00] text-black text-[9px] font-black uppercase tracking-wider">
                                      Couverture
                                    </span>
                                  )}
                                  {isIncluded && !isCover && (
                                    <span className="absolute top-1 right-1 p-0.5 rounded-full bg-[#CCFF00] text-black">
                                      <Check className="w-2.5 h-2.5" />
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] font-medium text-white/80 truncate w-full px-1" title={fileName}>
                                  {fileName}
                                </span>
                                <span className="text-[10px] text-white/50">
                                  {isIncluded ? '✓ Inclus (cliquer pour retirer)' : '+ Cliquer pour ajouter'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* List of currently assigned images for this project */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#A1A1AA] mb-2">
                      Images associées à ce projet ({activeEditingProject.images?.length || 0})
                    </label>

                    {(!activeEditingProject.images || activeEditingProject.images.length === 0) ? (
                      <div className="py-6 px-4 rounded-xl border border-dashed border-white/15 text-center text-xs text-white/50 space-y-2">
                        <ImageIcon className="w-6 h-6 mx-auto text-white/30" />
                        <p>Aucune image pour ce projet.</p>
                        <p className="text-white/40">
                          Cliquez sur <strong>"Ajouter une image"</strong> ou parcourez <strong>"/public/images"</strong> ci-dessus.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {activeEditingProject.images.map((imgUrl, index) => {
                          const isCover = activeEditingProject.imageUrl === imgUrl;
                          const fileName = imgUrl.split('/').pop() || `Image ${index + 1}`;

                          return (
                            <div
                              key={imgUrl + index}
                              className={`relative rounded-xl border p-2 flex flex-col justify-between gap-2 transition-all ${
                                isCover
                                  ? 'bg-[#CCFF00]/5 border-[#CCFF00]/50 ring-1 ring-[#CCFF00]/30'
                                  : 'bg-white/[0.03] border-white/10'
                              }`}
                            >
                              <div className="relative aspect-video rounded-lg overflow-hidden bg-black/60">
                                <img
                                  src={imgUrl}
                                  alt={fileName}
                                  className="w-full h-full object-cover"
                                />
                                {isCover && (
                                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#CCFF00] text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                                    <Star className="w-2.5 h-2.5 fill-current" /> Couverture
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                                <span className="text-xs text-white/70 truncate font-mono max-w-[140px]" title={imgUrl}>
                                  {fileName}
                                </span>

                                <div className="flex items-center gap-1">
                                  {!isCover && (
                                    <button
                                      type="button"
                                      onClick={() => setCoverImage(imgUrl)}
                                      className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
                                      title="Définir comme image de couverture"
                                    >
                                      Couverture
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => toggleImageInProject(imgUrl)}
                                    className="p-1 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer"
                                    title="Retirer cette image"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Manual URL input toggle (secondary / advanced) */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowManualUrlInput(!showManualUrlInput)}
                      className="text-xs text-[#A1A1AA] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Saisie manuelle d'URL ou liens externes (Unsplash, etc.)</span>
                      {showManualUrlInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {showManualUrlInput && (
                      <div className="mt-2.5 p-3 rounded-xl bg-black/30 border border-white/10 space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-[#A1A1AA] mb-1">
                            URL directe de l'image de couverture
                          </label>
                          <input
                            type="text"
                            placeholder="/images/MonImage.png ou https://..."
                            value={activeEditingProject.imageUrl}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateProjectField('imageUrl', val);
                              if (!activeEditingProject.images || activeEditingProject.images.length <= 1) {
                                handleUpdateProjectField('images', [val]);
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 text-white text-xs focus:outline-hidden focus:border-[#CCFF00]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-[#A1A1AA] mb-1">
                            Toutes les URLs (séparées par une virgule)
                          </label>
                          <input
                            type="text"
                            placeholder="/images/img1.png, /images/img2.png"
                            value={(activeEditingProject.images || []).join(', ')}
                            onChange={(e) => {
                              const split = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                              handleUpdateProjectField('images', split);
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 text-white text-xs focus:outline-hidden focus:border-[#CCFF00]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* PDF Document Section */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <FileText className="w-4 h-4 text-[#CCFF00]" />
                      <span>Document PDF (Rapport, Présentation, Dossier)</span>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => pdfInputRef.current?.click()}
                        disabled={isUploading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/15 disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Téléverser un PDF</span>
                      </button>
                      <input
                        ref={pdfInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Available PDFs from /public/pdf */}
                  {availablePdfs.length > 0 && (
                    <div className="p-3 rounded-xl bg-black/30 border border-white/10 space-y-2">
                      <div className="text-[11px] font-semibold text-white/70">
                        Documents disponibles dans <code className="text-[#CCFF00]">/public/pdf/</code> :
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availablePdfs.map((pdfPath) => {
                          const isCurrent = activeEditingProject.pdfUrl === pdfPath;
                          const name = pdfPath.split('/').pop()?.replace(/\.pdf$/i, '');
                          return (
                            <button
                              key={pdfPath}
                              type="button"
                              onClick={() => {
                                handleUpdateProjectField('pdfUrl', pdfPath);
                                if (!activeEditingProject.pdfTitle) {
                                  handleUpdateProjectField('pdfTitle', name || 'Document PDF');
                                }
                              }}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                                isCurrent
                                  ? 'bg-[#CCFF00]/15 border-[#CCFF00] text-[#CCFF00]'
                                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[200px]">{pdfPath.split('/').pop()}</span>
                              {isCurrent && <Check className="w-3 h-3 text-[#CCFF00]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-[#A1A1AA] mb-1.5">
                        Titre affiché du PDF
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Rapport complet du projet"
                        value={activeEditingProject.pdfTitle || ''}
                        onChange={(e) => handleUpdateProjectField('pdfTitle', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white text-sm focus:outline-hidden focus:border-[#CCFF00]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-[#A1A1AA] mb-1.5">
                        Chemin ou URL du fichier PDF
                      </label>
                      <input
                        type="text"
                        placeholder="/pdf/mon-document.pdf"
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
