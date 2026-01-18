import React from 'react';
import { Star, Skull, Repeat, UserCheck, Quote, Info, Search, Ghost } from 'lucide-react';
import { ProfessorRating } from '../types';

interface RatingCardProps {
  rating: ProfessorRating;
  professorName: string;
}

const ProgressBar: React.FC<{ value: number; max: number; label: string; icon: React.ReactNode }> = ({ value, max, label, icon }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center text-sm">
        <span className="text-ink font-bold text-xs uppercase tracking-widest flex items-center gap-2">
          {icon} {label}
        </span>
        <span className="font-typewriter text-sm font-bold bg-ink text-paper px-2 py-0.5 rounded-md">
          {value}/{max}
        </span>
      </div>
      <div className="h-4 w-full border-2 border-ink rounded-full p-0.5 bg-paper">
        <div 
          className="h-full bg-ink rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
          style={{ width: `${percentage}%` }}
        >
          {/* striped pattern inside bar */}
          <div className="absolute inset-0 w-full h-full opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB2aWV3Qm94PSIwIDAgNCA0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0tMSAxbDIgLTJNMCA0bDQgLTRNMyA1bDIgLTIiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')]"></div>
        </div>
      </div>
    </div>
  );
};

const RatingCard: React.FC<RatingCardProps> = ({ rating, professorName }) => {
  const displayName = rating.name || professorName;
  const isCorrected = rating.found && rating.name && rating.name.toLowerCase().trim() !== professorName.toLowerCase().trim();

  if (!rating.found) {
    return (
      <div className="w-full animate-in fade-in duration-500">
        <div className="bg-paper border-[3px] border-ink border-dashed rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
           <div className="flex items-center gap-4 w-full">
              <div className="w-16 h-16 rounded-full border-4 border-ink flex items-center justify-center bg-paper-dark text-ink flex-shrink-0">
                <Ghost className="w-8 h-8 stroke-[2]" />
              </div>
              <div>
                 <h3 className="text-lg font-display uppercase tracking-widest text-ink">Professor Not Found</h3>
                 <p className="text-sm font-typewriter text-ink/70">RateMyProfessors archives are empty.</p>
              </div>
           </div>
           <div className="text-xs text-ink italic whitespace-nowrap px-4 py-2 border border-ink rounded-full bg-paper-dark">
             Try correcting the spelling
           </div>
        </div>
      </div>
    );
  }

  const qualityNum = parseFloat(rating.quality);
  const diffNum = parseFloat(rating.difficulty);
  const takeAgainNum = parseFloat(rating.takeAgain.replace('%', ''));

  return (
    <div className="w-full animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-paper border-[3px] border-ink rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] relative overflow-hidden group">
        
        {/* Corner Decor */}
        <div className="absolute top-0 left-0 w-8 h-8 border-r-2 border-b-2 border-ink rounded-br-xl bg-ink"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-l-2 border-b-2 border-ink rounded-bl-xl bg-ink"></div>

        <div className="flex flex-col lg:flex-row gap-8 items-start mb-2 relative z-10">
          
          {/* Left: Profile */}
          <div className="flex-shrink-0 flex items-center gap-4 lg:w-1/4">
             <div className="w-20 h-20 rounded-full bg-paper border-[3px] border-ink flex items-center justify-center text-ink shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] overflow-hidden">
               <UserCheck className="w-10 h-10 stroke-[2]" />
             </div>
             <div>
               <h3 className="text-xl font-display uppercase tracking-wider text-ink">{displayName}</h3>
               {isCorrected && (
                 <p className="text-xs font-typewriter italic text-ink/60 mt-1">Found as: "{rating.name}"</p>
               )}
               <div className="flex items-center gap-2 mt-2">
                 <span className="px-2 py-0.5 rounded-full bg-ink text-paper border border-ink text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                   <Search className="w-3 h-3" /> AI FOUND
                 </span>
               </div>
             </div>
          </div>

          {/* Middle: Stats */}
          <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t-2 border-b-2 border-ink py-6 lg:border-none lg:py-0">
            <ProgressBar 
              value={qualityNum} 
              max={5} 
              label="Quality" 
              icon={<Star className="w-4 h-4 fill-ink" />}
            />
            <ProgressBar 
              value={diffNum} 
              max={5} 
              label="Difficulty" 
              icon={<Skull className="w-4 h-4" />}
            />
             <div className="flex flex-col gap-2 w-full">
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                  <Repeat className="w-4 h-4" /> Take Again
                </span>
                <span className="font-typewriter text-sm font-bold bg-ink text-paper px-2 py-0.5 rounded-md">
                  {rating.takeAgain}
                </span>
              </div>
              <div className="h-4 w-full border-2 border-ink rounded-full p-0.5 bg-paper">
                <div 
                  className="h-full bg-ink rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
                  style={{ width: `${takeAgainNum}%` }}
                >
                     <div className="absolute inset-0 w-full h-full opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB2aWV3Qm94PSIwIDAgNCA0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0tMSAxbDIgLTJNMCA0bDQgLTRNMyA1bDIgLTIiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:w-1/3 border-l-2 border-dashed border-ink pl-0 lg:pl-6 pt-4 lg:pt-0">
            <div className="relative">
              <Quote className="w-8 h-8 text-ink/20 absolute -top-4 -left-4 -scale-x-100" />
              <p className="text-ink font-typewriter text-sm leading-relaxed pl-3 font-medium">
                "{rating.summary}"
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="mt-4 pt-3 border-t-2 border-ink flex items-center justify-center gap-2 text-[10px] text-ink uppercase tracking-widest">
           <Info className="w-3 h-3 flex-shrink-0" />
           <p>Estimations via search • Verify on RateMyProfessors</p>
        </div>

      </div>
    </div>
  );
};

export default RatingCard;