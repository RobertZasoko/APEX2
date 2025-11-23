import React, { useEffect, useRef, useState } from 'react';

interface AudioVisualizerProps {
  mediaStream: MediaStream | null;
  isConnected: boolean;
}

const BAR_COUNT = 32;

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ mediaStream, isConnected }) => {
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(BAR_COUNT));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (mediaStream && isConnected) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      sourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStream);
      sourceRef.current.connect(analyserRef.current);

      const draw = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);

        const newBars = new Uint8Array(BAR_COUNT);
        const step = Math.floor(bufferLength / BAR_COUNT);
        for (let i = 0; i < BAR_COUNT; i++) {
            const start = i * step;
            const end = start + step;
            const slice = dataArray.slice(start, end);
            const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
            newBars[i] = avg;
        }
        setAudioData(newBars);
        animationFrameIdRef.current = requestAnimationFrame(draw);
      };

      draw();

    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      sourceRef.current?.disconnect();
      analyserRef.current = null;
      audioContextRef.current?.close().catch(console.error);
    };
  }, [mediaStream, isConnected]);

  return (
    <div className="flex items-center justify-center gap-1 h-12 w-48">
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const barHeight = isConnected ? (audioData[i] / 255) * 100 : 5;
        return (
          <div
            key={i}
            className="w-1 bg-primary rounded-full"
            style={{
              height: `${barHeight}%`,
              transition: 'height 0.1s ease-out'
            }}
          />
        );
      })}
    </div>
  );
};

export default AudioVisualizer;