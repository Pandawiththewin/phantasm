import React, { useEffect, useRef, useState } from 'react';
import { Mic, Play, Square, Radio, Loader2 } from 'lucide-react';
import { generateAudioSummary } from '../services/geminiService';

interface PhantomRadioProps {
  syllabusText: string;
}

const PhantomRadio: React.FC<PhantomRadioProps> = ({ syllabusText }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioData, setAudioData] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleTuneIn = async () => {
    if (isPlaying) {
        stopAudio();
        return;
    }

    if (!audioData) {
        setIsLoading(true);
        try {
            const data = await generateAudioSummary(syllabusText);
            setAudioData(data);
            playAudio(data);
        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
    } else {
        playAudio(audioData);
    }
  };

  const stopAudio = () => {
      if (sourceNodeRef.current) {
          sourceNodeRef.current.stop();
          sourceNodeRef.current = null;
      }
      setIsPlaying(false);
  };

  const playAudio = async (base64String: string) => {
    try {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        
        // Decode logic for raw PCM
        const binaryString = atob(base64String);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Convert to AudioBuffer
        const dataInt16 = new Int16Array(bytes.buffer);
        const frameCount = dataInt16.length;
        const audioBuffer = ctx.createBuffer(1, frameCount, 24000);
        const channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i] / 32768.0;
        }

        // Play
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
        
        sourceNodeRef.current = source;
        setIsPlaying(true);
        setIsLoading(false);
    } catch (e) {
        console.error("Error decoding audio", e);
        setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-paper border-[3px] border-ink rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] relative overflow-hidden group">
        <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full border-2 border-ink flex items-center justify-center ${isPlaying ? 'bg-ink text-paper' : 'bg-paper text-ink'}`}>
                    <Radio className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                    <h3 className="text-xl font-display uppercase text-ink">Phantom Radio</h3>
                    <p className="text-xs font-typewriter font-bold uppercase tracking-widest text-ink/70">
                        {isPlaying ? 'Broadcasting Live...' : 'Tune in for the brief'}
                    </p>
                </div>
            </div>

            <button 
                onClick={handleTuneIn}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-ink text-paper rounded-full font-bold uppercase tracking-widest border-2 border-ink hover:bg-paper hover:text-ink transition-all disabled:opacity-50"
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                    <>
                        <Square className="w-4 h-4 fill-current" /> Stop
                    </>
                ) : (
                    <>
                        <Play className="w-4 h-4 fill-current" /> Tune In
                    </>
                )}
            </button>
        </div>

        {/* Visualizer Bars */}
        {isPlaying && (
            <div className="flex items-end justify-center gap-1 h-8 mt-4 w-full opacity-80">
                {[...Array(20)].map((_, i) => (
                    <div 
                        key={i} 
                        className="w-1.5 bg-ink rounded-t-sm animate-film-jitter"
                        style={{ 
                            height: `${Math.random() * 100}%`,
                            animationDuration: `${0.2 + Math.random() * 0.3}s` 
                        }}
                    ></div>
                ))}
            </div>
        )}
        
        {/* Background Noise Texture */}
         <div className="absolute inset-0 w-full h-full opacity-10 pointer-events-none z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJnoiPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2cpIiBvcGFjaXR5PSIwLjQiLz48L3N2Zz4=')]"></div>
    </div>
  );
};

export default PhantomRadio;