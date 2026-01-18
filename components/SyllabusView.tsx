import React, { useState, useEffect } from 'react';
import { Download, PlayCircle, ExternalLink, Skull, BookOpen, Search, ShieldAlert, Film, CheckSquare, Copy, ClipboardCheck, FileDiff } from 'lucide-react';

interface SyllabusViewProps {
  content: string;
  courseCode: string;
  source: 'LIVE' | 'MOCK';
}

interface CardProps {
  title: string;
  children: React.ReactNode;
  icon: React.ElementType;
  className?: string;
  isFocusMode?: boolean;
}

const Card: React.FC<CardProps> = ({ title, children, icon: Icon, className = "", isFocusMode = false }) => {
  return (
    <div className={`bg-paper border-[3px] border-ink rounded-xl overflow-hidden flex flex-col ${className} shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] transition-transform hover:-translate-y-1 h-full min-h-[250px]`}>
      <div className="p-3 border-b-[3px] border-ink flex items-center gap-2.5 bg-paper-dark">
        <div className="bg-ink text-paper p-1 rounded-full">
           <Icon className="w-4 h-4 stroke-[3]" />
        </div>
        <h3 className="font-display text-lg tracking-wide uppercase text-ink flex-1">{title}</h3>
      </div>
      <div className="p-5 flex-grow text-sm text-ink leading-relaxed overflow-y-auto max-h-[400px] font-typewriter font-semibold">
        {children}
      </div>
    </div>
  );
};

const SyllabusView: React.FC<SyllabusViewProps> = ({ content, courseCode, source }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const storageKey = `phantasm_checks_${courseCode.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checkedItems));
  }, [checkedItems, storageKey]);

  const toggleItem = (text: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [text]: !prev[text]
    }));
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GHOST_SYLLABUS_${courseCode.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const extractSection = (header: string): string => {
    if (!content) return '';
    const normalizedContent = content.replace(/\r\n/g, '\n');
    const safeHeader = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const headers = ["Syllabus vs Reality", "Reality Check", "Hidden Prerequisites", "Panic Zones", "Golden Resources", "Phantom Library"];
    const lookaheadPattern = headers
        .filter(h => h !== header)
        .map(h => `(?:^|\\n)(?:[#*]*|\\d+\\.)\\s*${h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
        .join('|');

    const regex = new RegExp(
        `(?:^|\\n)(?:[#*]*|\\d+\\.)\\s*${safeHeader}[^\\n]*\\n([\\s\\S]*?)(?=${lookaheadPattern}|$)`, 
        'i'
    );

    const match = normalizedContent.match(regex);
    return match ? match[1].trim() : '';
  };

  const renderList = (text: string) => {
    if (!text || text.length < 10) return <p className="text-gray-500 italic">No data found in the archives.</p>;
    
    return text.split('\n').map((line, i) => {
      const cleanLine = line.trim();
      if (!cleanLine) return null;
      
      if (cleanLine.match(/^[-*•]\s/)) {
        const content = cleanLine.replace(/^[-*•]\s/, '').trim();
        const isChecked = !!checkedItems[content];

        return (
          <div 
             key={i} 
             className={`flex gap-3 items-start mb-3 last:mb-0 group cursor-pointer`}
             onClick={() => toggleItem(content)}
          >
             <div className={`mt-1 flex-shrink-0 w-4 h-4 border-2 border-ink bg-paper flex items-center justify-center transition-all ${isChecked ? 'bg-ink' : ''}`}>
               {isChecked && <CheckSquare className="w-3 h-3 text-paper" />}
             </div>
            <span className={`text-ink ${isChecked ? 'line-through opacity-50 decoration-2' : ''}`}>
                {content}
            </span>
          </div>
        );
      }
      return <p key={i} className="mb-3 last:mb-0">{cleanLine}</p>;
    });
  };

  const renderLibrary = (text: string) => {
    if (!text || text.length < 10) return <p className="text-gray-500 italic">No visual reels available.</p>;
    const lines = text.split('\n');
    return (
        <div className="space-y-4">
            {lines.map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                if (trimmed.startsWith('###') || trimmed.match(/^(Unit|Module)\s+\d+:/i)) {
                    return (
                        <h4 key={i} className="text-sm font-display mt-6 mb-2 uppercase tracking-wider border-b-2 border-ink pb-1 text-ink">
                            {trimmed.replace(/^[#\-*]+/, '').trim()}
                        </h4>
                    );
                }
                const linkMatch = trimmed.match(/\[(.*?)\]\((.*?)\)/);
                if (linkMatch) {
                    const [_, title, url] = linkMatch;
                    return (
                        <a 
                            key={i} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border-2 border-ink hover:bg-ink hover:text-paper transition-all group shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                        >
                            <PlayCircle className="w-5 h-5 flex-shrink-0 stroke-[2]" />
                            <div className="min-w-0 flex-grow">
                                <p className="font-bold truncate font-typewriter">{title}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        </a>
                    );
                }
                if (!trimmed.startsWith('[')) return <p key={i} className="text-xs text-ink/70">{trimmed}</p>;
                return null;
            })}
        </div>
    );
  };

  const realityCheck = extractSection("Reality Check");
  const prerequisites = extractSection("Hidden Prerequisites");
  const panicZones = extractSection("Panic Zones");
  const resources = extractSection("Golden Resources");
  const library = extractSection("Phantom Library");
  const syllabusVsReality = extractSection("Syllabus vs Reality");

  return (
    <div className={`w-full animate-in slide-in-from-bottom-4 duration-700`}>
      
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 px-1 gap-4">
         <div className="flex items-center gap-3">
            <h2 className="font-display text-3xl uppercase text-ink">The Script</h2>
         </div>

         <div className="flex flex-wrap items-center gap-3 relative">
           <button
             onClick={handleCopy}
             className="flex items-center gap-2 px-4 py-2 bg-paper border-[3px] border-ink rounded-full font-bold text-xs uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
           >
              {copied ? <ClipboardCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
           </button>
           <button
             onClick={handleDownload}
             className="flex items-center gap-2 px-4 py-2 bg-ink text-paper border-[3px] border-ink rounded-full font-bold text-xs uppercase tracking-widest hover:bg-paper hover:text-ink transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
           >
             <Download className="w-4 h-4" />
             Save .MD
           </button>
         </div>
      </div>

      {source === 'MOCK' && (
        <div className="mb-8 p-4 bg-paper border-[3px] border-ink rounded-lg flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(10,10,10,1)]">
            <ShieldAlert className="w-6 h-6 stroke-[3]" />
            <span className="font-display tracking-widest">⚠ SIMULATION MODE: LIVE CONNECTION SEVERED</span>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {syllabusVsReality && (
          <Card 
            title="Syllabus vs Reality" 
            icon={FileDiff} 
            className="md:col-span-2 lg:col-span-3 bg-paper"
            isFocusMode={isFocusMode}
          >
             {renderList(syllabusVsReality)}
          </Card>
        )}

        <Card title="Reality Check" icon={Search} className="row-span-2" isFocusMode={isFocusMode}>
           {renderList(realityCheck)}
        </Card>

        <Card title="Panic Zones" icon={Skull} isFocusMode={isFocusMode}>
           {renderList(panicZones)}
        </Card>

        <Card title="Hidden Prerequisites" icon={BookOpen} isFocusMode={isFocusMode}>
           {renderList(prerequisites)}
        </Card>

        <Card title="Golden Resources" icon={ShieldAlert} className="md:col-span-2 lg:col-span-1" isFocusMode={isFocusMode}>
           {renderList(resources)}
        </Card>
        
        <Card title="Phantom Library" icon={Film} className="md:col-span-2 lg:col-span-3" isFocusMode={isFocusMode}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderLibrary(library)}
            </div>
        </Card>
      </div>
    </div>
  );
};

export default SyllabusView;