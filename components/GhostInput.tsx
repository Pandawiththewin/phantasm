import React, { useState } from 'react';
import { Search, LucideIcon } from 'lucide-react';

interface GhostInputProps {
  value: string;
  onChange: (val: string) => void;
  onEnter: () => void;
  disabled?: boolean;
  placeholder?: string;
  icon?: LucideIcon;
  label?: string;
}

const GhostInput: React.FC<GhostInputProps> = ({ 
  value, 
  onChange, 
  onEnter, 
  disabled, 
  placeholder = "Enter...", 
  icon: Icon = Search,
  label
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs font-display tracking-widest uppercase ml-1 text-ink">{label}</label>
      )}
      <div className={`relative flex items-center bg-paper transition-all duration-200 rounded-lg overflow-hidden h-12
        border-[3px] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]
        ${isFocused 
          ? 'border-ink translate-x-[1px] translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(10,10,10,1)]' 
          : 'border-ink'
        }
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}
      `}>
        <div className={`pl-3 flex items-center pointer-events-none text-ink`}>
          <Icon className="h-5 w-5 stroke-[3]" />
        </div>
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onEnter()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full pl-2 pr-3 py-3 bg-transparent border-none text-ink placeholder-silver font-bold font-typewriter
                     focus:ring-0 focus:outline-none text-base uppercase"
        />
      </div>
    </div>
  );
};

export default GhostInput;