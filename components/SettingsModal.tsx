import React, { useState, useEffect } from 'react';
import { X, BookLock, HelpCircle, Save, CheckSquare, Terminal, ExternalLink } from 'lucide-react';
import { HARDCODED_LEDGER_CONFIG } from '../services/openNoteService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [ledgerUrl, setLedgerUrl] = useState('');
  const [ledgerToken, setLedgerToken] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'SAVED'>('IDLE');

  // Load from storage when modal opens, or fall back to hardcoded defaults
  useEffect(() => {
    if (isOpen) {
      setLedgerUrl(localStorage.getItem('phantasm_ledger_url') || HARDCODED_LEDGER_CONFIG.url);
      setLedgerToken(localStorage.getItem('phantasm_ledger_token') || HARDCODED_LEDGER_CONFIG.token);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('phantasm_ledger_url', ledgerUrl);
    localStorage.setItem('phantasm_ledger_token', ledgerToken);
    setStatus('SAVED');
    setTimeout(() => {
      setStatus('IDLE');
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-paper border-[4px] border-ink rounded-xl p-6 w-full max-w-lg shadow-[12px_12px_0px_0px_rgba(10,10,10,1)] relative animate-pop max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-ink text-paper p-1 rounded-full border-2 border-paper hover:scale-110 transition-transform"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-ink p-2 rounded-lg">
            <BookLock className="w-6 h-6 text-paper" />
          </div>
          <div>
            <h3 className="text-xl font-display uppercase">Link the Ledger</h3>
            <p className="text-[10px] font-typewriter uppercase tracking-widest text-ink/60">Connect to Memos Database</p>
          </div>
        </div>
        
        {/* Connection Form */}
        <div className="space-y-5 bg-paper-dark p-4 rounded-lg border-2 border-ink">
          <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
               Server URL
            </label>
            <input 
              type="text" 
              value={ledgerUrl}
              onChange={(e) => setLedgerUrl(e.target.value)}
              placeholder="http://localhost:5230"
              className="w-full bg-paper border-[2px] border-ink p-2 font-typewriter text-sm rounded shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1">Access Token</label>
            <input 
              type="password" 
              value={ledgerToken}
              onChange={(e) => setLedgerToken(e.target.value)}
              placeholder="ey..."
              className="w-full bg-paper border-[2px] border-ink p-2 font-typewriter text-sm rounded shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none transition-all"
            />
          </div>

          <button 
            onClick={handleSave}
            className="w-full h-12 bg-ink text-paper font-display text-lg uppercase tracking-widest border-2 border-transparent hover:bg-paper hover:text-ink hover:border-ink transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] active:shadow-none active:translate-y-1"
          >
            {status === 'SAVED' ? 'Linked Successfully' : 'Save Connection'}
            {status === 'SAVED' ? <CheckSquare className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          </button>
        </div>

        {/* Setup Guide */}
        <div className="mt-6 border-t-2 border-ink pt-4">
           <h4 className="font-display uppercase text-sm mb-3 flex items-center gap-2">
             <Terminal className="w-4 h-4" /> No Database? Run this:
           </h4>
           
           <div className="bg-black text-green-400 p-3 rounded font-mono text-xs overflow-x-auto whitespace-nowrap mb-2 border-2 border-ink">
             docker run -d -p 5230:5230 neosmemo/memos:stable
           </div>
           
           <div className="text-xs text-ink/70 space-y-2 font-typewriter">
             <p>1. Run the command above in your terminal.</p>
             <p>2. Open <a href="http://localhost:5230" target="_blank" className="underline font-bold hover:text-blue-600">http://localhost:5230</a> to create your admin account.</p>
             <p>3. Go to <strong>Settings &rarr; Access Tokens</strong> to generate your key.</p>
           </div>

           <a href="https://github.com/usememos/memos" target="_blank" className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-blue-600">
             <ExternalLink className="w-3 h-3" /> View Official Memos Documentation
           </a>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;