
import { useState, useCallback, useRef } from 'react';
import { decode, decodeAudioData } from '../services/geminiService';

const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const playAudio = useCallback(async (base64Audio: string) => {
    if (isPlaying || isLoading) return;
    setIsLoading(true);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const context = audioContextRef.current;
      
      const audioData = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioData, context, 24000, 1);

      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(context.destination);
      source.onended = () => {
        setIsPlaying(false);
        sourceRef.current = null;
      };
      
      source.start();
      sourceRef.current = source;
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing audio:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isPlaying, isLoading]);

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  return { playAudio, stopAudio, isPlaying, isLoading };
};

export default useAudioPlayer;
