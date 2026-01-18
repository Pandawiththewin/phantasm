import React, { useState } from 'react';
import { Loader2, Sparkles, AlertOctagon, GraduationCap, BookOpen, User, Ghost, ImagePlus, X, FileText, Film, Settings, TrainFront } from 'lucide-react';
import GhostInput from './components/GhostInput';
import SyllabusView from './components/SyllabusView';
import CramTramView from './components/CramTramView';
import RatingCard from './components/RatingCard';
import PhantomRadio from './components/PhantomRadio';
import SettingsModal from './components/SettingsModal';
import { fetchRedditData } from './services/redditService';
import { generateSyllabus, getProfessorRating } from './services/geminiService';
import { FetchStatus, ProfessorRating } from './types';

const App: React.FC = () => {
  if (!process.env.API_KEY) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-4 font-typewriter">
        <div className="bg-paper border-[4px] border-ink p-8 max-w-md text-center shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
          <AlertOctagon className="w-16 h-16 text-ink mx-auto mb-4 stroke-[3]" />
          <h1 className="text-2xl font-display uppercase mb-4">Reel Missing!</h1>
          <p className="text-ink text-sm">Please insert your <code className="bg-ink text-paper px-1">GEMINI_API_KEY</code> to begin the show.</p>
        </div>
      </div>
    );
  }

  const [university, setUniversity] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [professor, setProfessor] = useState('');
  const [status, setStatus] = useState<FetchStatus>(FetchStatus.IDLE);
  const [syllabus, setSyllabus] = useState<string | null>(null);
  const [rating, setRating] = useState<ProfessorRating | null>(null);
  const [source, setSource] = useState<'LIVE' | 'MOCK'>('LIVE');
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // View State for Cram Tram
  const [view, setView] = useState<'DASHBOARD' | 'CRAM_TRAM'>('DASHBOARD');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!courseCode.trim() || !university.trim()) return;
    setStatus(FetchStatus.LOADING);
    setSyllabus(null);
    setRating(null);
    setError(null);

    try {
      const redditPromise = fetchRedditData(university, courseCode, professor);
      const ratingPromise = professor && professor.trim() 
        ? getProfessorRating(university, professor) 
        : Promise.resolve(null);

      const [redditRes, ratingRes] = await Promise.all([redditPromise, ratingPromise]);
      setSource(redditRes.source);
      setRating(ratingRes);

      const generatedSyllabus = await generateSyllabus(university, courseCode, redditRes.data, professor, selectedFile);
      setSyllabus(generatedSyllabus);
      setStatus(FetchStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "The projector jammed (Connection failed).");
      setStatus(FetchStatus.ERROR);
    }
  };

  // If in Cram Tram mode, show that component exclusively
  if (view === 'CRAM_TRAM') {
    return (
      <CramTramView 
        courseCode={courseCode || "Unknown Course"} 
        syllabusContext={syllabus}
        onBack={() => setView('DASHBOARD')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-ink font-typewriter flex flex-col">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* Top Header Card */}
      <header className="pt-8 pb-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto bg-paper border-[4px] border-ink p-4 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
             
             {/* Title Block */}
            <div className="flex items-center gap-4 z-10 animate-film-jitter">
              <div className="bg-ink p-3 rounded-full border-2 border-paper ring-4 ring-ink animate-bounce">
                <Ghost className="w-8 h-8 text-paper stroke-[3]" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-display tracking-wide uppercase text-ink drop-shadow-sm">PHANTASM</h1>
                <p className="text-xs font-bold uppercase tracking-[0.3em] border-t-2 border-ink pt-1 mt-1">The Ghost Syllabus</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex-1 w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-4 z-10">
                 <div className="md:col-span-3">
                   <GhostInput 
                      value={university} 
                      onChange={setUniversity} 
                      onEnter={() => {}} 
                      disabled={status === FetchStatus.LOADING}
                      placeholder="University"
                      label="Location"
                      icon={GraduationCap}
                    />
                 </div>
                 <div className="md:col-span-3">
                    <GhostInput 
                      value={courseCode} 
                      onChange={setCourseCode} 
                      onEnter={() => {}}
                      disabled={status === FetchStatus.LOADING}
                      placeholder="Course ID"
                      label="Subject"
                      icon={BookOpen}
                    />
                 </div>
                 <div className="md:col-span-3">
                     <GhostInput 
                      value={professor} 
                      onChange={setProfessor} 
                      onEnter={handleGenerate}
                      disabled={status === FetchStatus.LOADING}
                      placeholder="Professor"
                      label="Teacher"
                      icon={User}
                    />
                 </div>
                 
                 {/* File Upload - Styled as a "Plate" */}
                 <div className="md:col-span-3 flex flex-col gap-1">
                   <label className="text-xs font-display tracking-widest uppercase ml-1 text-ink">Evidence</label>
                   <div className="relative group h-12">
                     <input 
                       type="file" 
                       accept="image/*,application/pdf"
                       onChange={handleFileSelect}
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                       disabled={status === FetchStatus.LOADING}
                     />
                     <div className={`h-full flex items-center justify-between px-3 bg-paper border-[3px] rounded-lg transition-all ${selectedFile ? 'border-ink bg-gray-200' : 'border-ink border-dashed hover:bg-gray-100'}`}>
                        {selectedFile ? (
                          <>
                            <div className="flex items-center gap-2 truncate max-w-[80%]">
                              <FileText className="w-4 h-4 text-ink flex-shrink-0" />
                              <span className="text-xs font-bold truncate">{selectedFile.name}</span>
                            </div>
                            <button onClick={(e) => {e.preventDefault(); setSelectedFile(null)}} className="z-20 p-1 hover:bg-ink hover:text-paper rounded-full transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-ink/60 text-sm font-bold w-full justify-center">
                            <ImagePlus className="w-4 h-4" />
                            <span className="text-xs uppercase">Add Doc</span>
                          </div>
                        )}
                     </div>
                   </div>
                 </div>
            </div>

            {/* Buttons Group */}
            <div className="w-full md:w-auto flex flex-col gap-3 justify-end z-10 mt-5 md:mt-0 items-center">
              <button
                onClick={handleGenerate}
                disabled={!courseCode.trim() || !university.trim() || status === FetchStatus.LOADING}
                className="h-12 px-8 bg-ink text-paper rounded-full font-display text-xl uppercase tracking-widest border-[3px] border-paper ring-4 ring-ink hover:scale-105 active:scale-95 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {status === FetchStatus.LOADING ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  "Animate!"
                )}
              </button>

              <div className="flex items-center gap-4">
                  <button 
                     onClick={() => setIsSettingsOpen(true)}
                     className="mt-2 text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-1 opacity-60 hover:opacity-100"
                  >
                      <Settings className="w-3 h-3" /> Connection
                  </button>

                  <button 
                     onClick={() => setView('CRAM_TRAM')}
                     className="mt-2 text-[10px] font-bold uppercase tracking-widest hover:text-red-600 flex items-center gap-1 opacity-60 hover:opacity-100 animate-pulse"
                  >
                      <TrainFront className="w-3 h-3" /> Cram Tram
                  </button>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none rotate-12">
               <Film className="w-64 h-64 text-ink" />
            </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {error && (
            <div className="p-6 bg-paper border-[3px] border-ink rounded-xl flex items-center gap-4 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
              <div className="bg-ink text-paper p-2 rounded-full">
                <AlertOctagon className="w-8 h-8 stroke-[3]" />
              </div>
              <p className="text-ink font-bold font-typewriter uppercase">{error}</p>
            </div>
          )}

          {status === FetchStatus.IDLE && (
            <div className="flex flex-col items-center justify-center py-20 opacity-60 text-center">
               <div className="w-48 h-48 border-[6px] border-ink rounded-full flex items-center justify-center mb-6 bg-paper shadow-[12px_12px_0px_0px_rgba(10,10,10,1)] animate-pop">
                  <Ghost className="w-24 h-24 text-ink stroke-[3]" />
               </div>
               <h2 className="text-4xl font-display uppercase text-ink mb-4">The Stage is Set</h2>
               <p className="text-ink font-bold font-typewriter max-w-md bg-paper p-2 border-2 border-ink -rotate-1 shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                 Enter your course details above to begin the reel.
               </p>
            </div>
          )}

          {status === FetchStatus.SUCCESS && (
            <div className="space-y-8 pb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {rating && <RatingCard rating={rating} professorName={professor} />}
                {syllabus && <PhantomRadio syllabusText={syllabus} />}
              </div>
              
              {syllabus && (
                <SyllabusView 
                  content={syllabus} 
                  courseCode={`${university} ${courseCode}`}
                  source={source}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;