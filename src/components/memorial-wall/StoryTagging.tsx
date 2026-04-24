"use client";

import React, { useState, useRef } from 'react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useMemorialStore } from '@/hooks/useMemorialStore';
import type { Memory, MediaItem } from '@/types/media';
import { 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  Square, 
  Trash2, 
  Send,
  MessageCircle,
  User,
  X,
  Volume2
} from 'lucide-react';

interface StoryTaggingProps {
  mediaId: string;
  onMemoryAdded?: (memory: Memory) => void;
  onClose?: () => void;
}

export function StoryTagging({ mediaId, onMemoryAdded, onClose }: StoryTaggingProps) {
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [textContent, setTextContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    isRecording,
    isPaused,
    duration,
    audioUrl,
    audioBlob,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    formatDuration,
  } = useVoiceRecorder();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSubmit = async () => {
    if (!authorName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (mode === 'text' && !textContent.trim()) {
      setError('Please enter your memory');
      return;
    }

    if (mode === 'voice' && !audioBlob) {
      setError('Please record a voice note');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // In production, this would upload to storage and save to database
      const memory: Memory = {
        id: `memory-${Date.now()}`,
        type: mode,
        content: mode === 'text' ? textContent : audioUrl || '',
        authorName: authorName.trim(),
        createdAt: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      onMemoryAdded?.(memory);
      
      // Reset form
      setTextContent('');
      setAuthorName('');
      clearRecording();
      
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError('Failed to save memory. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      setError(null);
      await startRecording();
    } catch {
      setError('Microphone access is required for voice notes');
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-white">Add Your Memory</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="flex p-2 gap-2 bg-slate-900/50">
        <button
          onClick={() => setMode('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            mode === 'text'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-700/50 text-slate-400 hover:text-white'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Text Memory
        </button>
        <button
          onClick={() => setMode('voice')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            mode === 'voice'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-700/50 text-slate-400 hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4" />
          Voice Note
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 space-y-4">
        {/* Author Name */}
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Your Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Enter your name"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Text Mode */}
        {mode === 'text' && (
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Your Memory</label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Share a memory, story, or message about this moment..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <div className="text-xs text-slate-500 mt-1 text-right">
              {textContent.length} / 1000 characters
            </div>
          </div>
        )}

        {/* Voice Mode */}
        {mode === 'voice' && (
          <div className="space-y-4">
            {/* Recording Controls */}
            {!audioUrl ? (
              <div className="flex flex-col items-center py-6">
                {isRecording ? (
                  <>
                    {/* Recording indicator */}
                    <div className="relative mb-4">
                      <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-red-500/30 flex items-center justify-center animate-pulse">
                          <Mic className="w-8 h-8 text-red-500" />
                        </div>
                      </div>
                      {!isPaused && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                      )}
                    </div>
                    
                    {/* Duration */}
                    <span className="text-2xl font-mono text-white mb-4">
                      {formatDuration(duration)}
                    </span>
                    
                    {/* Recording actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={isPaused ? resumeRecording : pauseRecording}
                        className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors"
                        title={isPaused ? 'Resume' : 'Pause'}
                      >
                        {isPaused ? (
                          <Play className="w-5 h-5 text-white" />
                        ) : (
                          <Pause className="w-5 h-5 text-white" />
                        )}
                      </button>
                      <button
                        onClick={stopRecording}
                        className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                        title="Stop Recording"
                      >
                        <Square className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleStartRecording}
                      className="w-20 h-20 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-indigo-600/25"
                    >
                      <Mic className="w-8 h-8 text-white" />
                    </button>
                    <span className="text-slate-400 text-sm mt-4">
                      Tap to start recording
                    </span>
                  </>
                )}
              </div>
            ) : (
              /* Playback Controls */
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                      <Volume2 className="w-4 h-4" />
                      <span>Voice Note</span>
                    </div>
                    <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-0 transition-all" />
                    </div>
                  </div>
                  
                  <span className="text-slate-400 text-sm font-mono">
                    {formatDuration(duration)}
                  </span>
                  
                  <button
                    onClick={clearRecording}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Delete recording"
                  >
                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                  </button>
                </div>
                
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isRecording}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
            isSubmitting || isRecording
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Share Memory
            </>
          )}
        </button>
      </div>
    </div>
  );
}
