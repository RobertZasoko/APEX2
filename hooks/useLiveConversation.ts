import { useState, useRef, useCallback } from 'react';
// Fix: Removed `LiveSession` as it's not an exported member.
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAI_Blob } from '@google/genai';
import { TranscriptMessage } from '../types';
import { decode, decodeAudioData, encode, getGenAI } from '../services/geminiService';

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'closed' | 'error';

interface UseLiveConversationProps {
  systemInstruction: string;
  isRecordingEnabled?: boolean;
  audioDeviceId?: string;
}

const useLiveConversation = ({ systemInstruction, isRecordingEnabled = false, audioDeviceId }: UseLiveConversationProps) => {
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const aiRef = useRef<GoogleGenAI | null>(null);
  // Fix: Replaced `LiveSession` with `any` as it's an internal type.
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  const handleMessage = useCallback(async (message: LiveServerMessage) => {
    if (message.serverContent?.outputTranscription) {
      const text = message.serverContent.outputTranscription.text;
      setTranscript(prev => {
          const last = prev[prev.length - 1];
          if (last && last.speaker === 'ai' && last.isPartial) {
            const newLast = { ...last, text: last.text + text };
            return [...prev.slice(0, -1), newLast];
          }
          return [...prev, { speaker: 'ai', text, isPartial: true }];
      });
    }

    if(message.serverContent?.inputTranscription) {
        const text = message.serverContent.inputTranscription.text;
        setTranscript(prev => {
            const last = prev[prev.length-1];
            if (last && last.speaker === 'user' && last.isPartial) {
                const newLast = {...last, text: last.text + text};
                return [...prev.slice(0, -1), newLast];
            }
            return [...prev, {speaker: 'user', text, isPartial: true}];
        });
    }

    if (message.serverContent?.turnComplete) {
      setTranscript(prev => prev.map(msg => ({...msg, isPartial: false})));
    }

    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (base64Audio && outputAudioContextRef.current && outputNodeRef.current) {
        const context = outputAudioContextRef.current;
        if (context.state === 'suspended') {
            await context.resume();
        }
        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, context.currentTime);
        const audioBuffer = await decodeAudioData(decode(base64Audio), context, 24000, 1);
        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputNodeRef.current);
        source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;
        audioSourcesRef.current.add(source);
    }
  }, []);

  const startSession = useCallback(async () => {
    setError(null);
    setConnectionState('connecting');
    setTranscript([]);
    
    try {
      aiRef.current = getGenAI();
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Create and connect a persistent GainNode for audio output.
      // This is more reliable than connecting each new audio source to the destination directly.
      outputNodeRef.current = outputAudioContextRef.current.createGain();
      outputNodeRef.current.connect(outputAudioContextRef.current.destination);

      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      };

      if (audioDeviceId) {
        audioConstraints.deviceId = { exact: audioDeviceId };
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      mediaStreamRef.current = stream;
      setMediaStream(stream);

      if (isRecordingEnabled) {
        const recorderOptions: MediaRecorderOptions = {
            audioBitsPerSecond: 128000, // Higher bitrate for better quality
            mimeType: 'audio/webm;codecs=opus',
        };

        // Check if the preferred mimeType is supported, otherwise let the browser choose.
        if (!MediaRecorder.isTypeSupported(recorderOptions.mimeType)) {
            console.warn(`${recorderOptions.mimeType} is not supported. Falling back to default.`);
            delete recorderOptions.mimeType;
        }
        
        mediaRecorderRef.current = new MediaRecorder(mediaStreamRef.current, recorderOptions);
        recordedChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
        mediaRecorderRef.current.start();
      }

      sessionPromiseRef.current = aiRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setConnectionState('connected');
            const source = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
            scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (event) => {
              const inputData = event.inputBuffer.getChannelData(0);
              const l = inputData.length;
              // Fix: Corrected typo from Int116Array to Int16Array.
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: GenAI_Blob = {
                  data: encode(new Uint8Array(int16.buffer)),
                  mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromiseRef.current?.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessorRef.current);
            // This connection is required for the onaudioprocess event to fire.
            // Without it, no audio is sent to the Gemini API.
            scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: handleMessage,
          onerror: (e: ErrorEvent) => {
            console.error('Live session error:', e);
            setError("A live session error occurred.");
            setConnectionState('error');
          },
          onclose: () => {
            setConnectionState('closed');
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' }}},
          systemInstruction: systemInstruction,
        },
      });

    } catch (error) {
      console.error('Failed to start session:', error);
      if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError')) {
          setError("Microphone permission denied. Please allow microphone access in your browser settings and try again.");
      } else if (error instanceof Error) {
          setError(`An unexpected error occurred: ${error.message}`);
      } else {
          setError("An unexpected error occurred while starting the call.");
      }
      setConnectionState('error');
    }
  }, [systemInstruction, handleMessage, isRecordingEnabled, audioDeviceId]);

  const stopRecordingAndGetUrl = useCallback((): Promise<string | null> => {
    if (!isRecordingEnabled) {
        return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.onstop = () => {
          const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const blob = new Blob(recordedChunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          resolve(url);
          recordedChunksRef.current = [];
        };
        mediaRecorderRef.current.stop();
      } else {
        resolve(null);
      }
    });
  }, [isRecordingEnabled]);

  const endSession = useCallback(() => {
    if (isRecordingEnabled && mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    sessionPromiseRef.current?.then(session => session.close());
    
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    scriptProcessorRef.current?.disconnect();
    outputNodeRef.current?.disconnect();
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    audioSourcesRef.current.forEach(source => source.stop());

    sessionPromiseRef.current = null;
    mediaStreamRef.current = null;
    scriptProcessorRef.current = null;
    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;
    outputNodeRef.current = null;
    audioSourcesRef.current.clear();
    setMediaStream(null);


    if(connectionState !== 'error') {
      setConnectionState('closed');
    }
  }, [connectionState, isRecordingEnabled]);

  return { transcript, connectionState, mediaStream, startSession, endSession, stopRecordingAndGetUrl, error };
};

export default useLiveConversation;