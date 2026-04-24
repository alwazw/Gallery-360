"use client";

import React, { useState } from "react";
import { useMemorialStore } from "@/hooks/useMemorialStore";
import { useAIProcessing } from "@/hooks/useAIProcessing";
import { 
  Sparkles, 
  Users, 
  BookOpen, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ChevronRight,
  X,
  Brain,
  Scan,
  Shield
} from "lucide-react";

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIPanel({ isOpen, onClose }: AIPanelProps) {
  const { knownFaces, chapters, setFilters, media } = useMemorialStore();
  const { isProcessing, progress, error, processAllMedia } = useAIProcessing();
  const [processComplete, setProcessComplete] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const handleProcess = async () => {
    setProcessComplete(false);
    const result = await processAllMedia();
    if (result) {
      setStats(result);
      setProcessComplete(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-slate-900/95 backdrop-blur-lg border-l border-slate-700/50 z-50 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">AI Discovery</h2>
            <p className="text-xs text-slate-400">Powered by AI</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Process button */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3 mb-4">
            <Brain className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-white">AI Analysis</h3>
              <p className="text-xs text-slate-400 mt-1">
                Automatically detect faces, extract metadata, and organize your memories into life chapters.
              </p>
            </div>
          </div>

          {isProcessing ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-indigo-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing {media.length} items...</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : processComplete ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Analysis complete!</span>
              </div>
              {stats && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-white">{stats.uniqueFaces}</div>
                    <div className="text-slate-400">Faces found</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-white">{stats.chapters}</div>
                    <div className="text-slate-400">Life chapters</div>
                  </div>
                </div>
              )}
              <button
                onClick={handleProcess}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
              >
                Re-analyze
              </button>
            </div>
          ) : (
            <button
              onClick={handleProcess}
              disabled={media.length === 0}
              className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Scan className="w-4 h-4" />
              Analyze All Media
            </button>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 mt-3">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Faces section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-medium text-white">People</h3>
            <span className="text-xs text-slate-500">({knownFaces.length})</span>
          </div>

          {knownFaces.length === 0 ? (
            <div className="bg-slate-800/30 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-500">
                No faces detected yet. Run AI analysis to identify people in photos.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {knownFaces.map((face) => (
                <button
                  key={face.id}
                  onClick={() => setFilters({ faceId: face.id })}
                  className="w-full flex items-center gap-3 p-3 bg-slate-800/30 hover:bg-slate-700/50 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0">
                    {face.thumbnail ? (
                      <img 
                        src={face.thumbnail} 
                        alt={face.name || 'Unknown'} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-slate-300">
                        {(face.name || '?')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {face.name || 'Unknown Person'}
                      </span>
                      {face.isDeceased && (
                        <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded">
                          Deceased
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {face.count} {face.count === 1 ? 'photo' : 'photos'}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Life chapters section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-medium text-white">Life Chapters</h3>
            <span className="text-xs text-slate-500">({chapters.length})</span>
          </div>

          {chapters.length === 0 ? (
            <div className="bg-slate-800/30 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-500">
                No chapters identified yet. AI will organize memories by life events.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <button
                  key={chapter}
                  onClick={() => setFilters({ chapter })}
                  className="w-full flex items-center justify-between p-3 bg-slate-800/30 hover:bg-slate-700/50 rounded-lg transition-colors text-left"
                >
                  <span className="text-sm text-slate-200">{chapter}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content moderation info */}
        <div className="bg-slate-800/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-white">Content Moderation</h4>
              <p className="text-xs text-slate-400 mt-1">
                AI automatically screens uploaded content for appropriateness before display.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <p className="text-[10px] text-slate-500 text-center">
          AI processing is simulated for demo. In production, connects to Immich/AWS Rekognition.
        </p>
      </div>
    </div>
  );
}
