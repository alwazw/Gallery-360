"use client";

import React, { useState } from "react";
import { useMemorialStore } from "@/hooks/useMemorialStore";
import { 
  Search, 
  Filter, 
  Users, 
  Clock, 
  Share2, 
  Settings,
  ChevronDown,
  X,
  Eye,
  EyeOff,
  User,
  BookOpen,
  Sparkles,
  Upload
} from "lucide-react";
import { AIPanel } from "./AIPanel";
import { ContributionPortal } from "../contribution/ContributionPortal";

// Filter panel component
function FilterPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { 
    filters, 
    setFilters, 
    clearFilters, 
    knownFaces, 
    chapters,
    media
  } = useMemorialStore();

  if (!isOpen) return null;

  const visibilityOptions = [
    { value: 'public', label: 'Public', icon: Eye, color: 'text-green-400' },
    { value: 'family', label: 'Family Only', icon: Users, color: 'text-amber-400' },
    { value: 'admin', label: 'Admin Only', icon: EyeOff, color: 'text-red-400' },
  ];

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <h3 className="font-semibold text-white">Filters</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearFilters}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Clear all
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
        {/* Visibility filter */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            Visibility
          </label>
          <div className="space-y-2">
            {visibilityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilters({ 
                  visibility: filters.visibility === option.value ? undefined : option.value as any 
                })}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  filters.visibility === option.value
                    ? 'bg-indigo-600/30 border border-indigo-500/50'
                    : 'bg-slate-800/50 hover:bg-slate-700/50 border border-transparent'
                }`}
              >
                <option.icon className={`w-4 h-4 ${option.color}`} />
                <span className="text-sm text-slate-200">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Face filter */}
        {knownFaces.length > 0 && (
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Filter by Person
            </label>
            <div className="flex flex-wrap gap-2">
              {knownFaces.map((face) => (
                <button
                  key={face.id}
                  onClick={() => setFilters({ 
                    faceId: filters.faceId === face.id ? undefined : face.id 
                  })}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    filters.faceId === face.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  {face.name || `Person ${face.id.slice(0, 4)}`}
                  <span className="ml-1 text-xs opacity-60">({face.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Life chapters filter */}
        {chapters.length > 0 && (
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Life Chapters
            </label>
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <button
                  key={chapter}
                  onClick={() => setFilters({ 
                    chapter: filters.chapter === chapter ? undefined : chapter 
                  })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    filters.chapter === chapter
                      ? 'bg-indigo-600/30 border border-indigo-500/50 text-white'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  {chapter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="pt-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-500">
            Showing {media.length} items
          </div>
        </div>
      </div>
    </div>
  );
}

// Search component
function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { setFilters } = useMemorialStore();

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setFilters({ search: value || undefined });
  };

  return (
    <div className={`relative flex items-center transition-all duration-300 ${
      isExpanded ? 'w-64' : 'w-10'
    }`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute left-0 z-10 p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 transition-colors"
      >
        <Search className="w-4 h-4 text-slate-300" />
      </button>
      
      {isExpanded && (
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search memories..."
          autoFocus
          className="w-full pl-12 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-full text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
        />
      )}
    </div>
  );
}

// Share button with invite functionality
function ShareButton() {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Memorial Wall',
          text: 'View this memorial and share your memories',
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-medium transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Invite Others</span>
      </button>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap">
          Link copied!
        </div>
      )}
    </div>
  );
}

export function NavigationHUD() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const { filters, media, filteredMedia } = useMemorialStore();
  
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);
  const filterCount = Object.values(filters).filter(v => v !== undefined).length;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
      {/* Top gradient overlay */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
      
      {/* Navigation content */}
      <div className="relative flex items-start justify-between p-4 sm:p-6">
        {/* Left side - Logo / Memorial info */}
        <div className="pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">Memorial Wall</h1>
              <p className="text-slate-400 text-xs">
                {filteredMedia.length} {filteredMedia.length === 1 ? 'memory' : 'memories'}
                {hasActiveFilters && ` (filtered from ${media.length})`}
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <SearchBar />
          
          {/* AI Discovery button */}
          <button
            onClick={() => setIsAIPanelOpen(true)}
            className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full text-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI</span>
          </button>
          
          {/* Filter button */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-full text-sm transition-all ${
                hasActiveFilters
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
              {filterCount > 0 && (
                <span className="w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center">
                  {filterCount}
                </span>
              )}
            </button>
            
            <FilterPanel 
              isOpen={isFilterOpen} 
              onClose={() => setIsFilterOpen(false)} 
            />
          </div>

          {/* Contribute button */}
          <button
            onClick={() => setIsContributionOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Contribute</span>
          </button>

          <ShareButton />
        </div>
      </div>

      {/* AI Panel */}
      <AIPanel isOpen={isAIPanelOpen} onClose={() => setIsAIPanelOpen(false)} />
      
      {/* Contribution Portal */}
      <ContributionPortal 
        isOpen={isContributionOpen} 
        onClose={() => setIsContributionOpen(false)}
        memorialName="Memorial Wall"
      />

      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="px-4 sm:px-6 pb-4 pointer-events-auto">
          <div className="flex flex-wrap gap-2">
            {filters.visibility && (
              <FilterPill 
                label={`Visibility: ${filters.visibility}`}
                onRemove={() => useMemorialStore.getState().setFilters({ visibility: undefined })}
              />
            )}
            {filters.chapter && (
              <FilterPill 
                label={`Chapter: ${filters.chapter}`}
                onRemove={() => useMemorialStore.getState().setFilters({ chapter: undefined })}
              />
            )}
            {filters.faceId && (
              <FilterPill 
                label="Filtered by person"
                onRemove={() => useMemorialStore.getState().setFilters({ faceId: undefined })}
              />
            )}
            {filters.search && (
              <FilterPill 
                label={`Search: "${filters.search}"`}
                onRemove={() => useMemorialStore.getState().setFilters({ search: undefined })}
              />
            )}
          </div>
        </div>
      )}

      {/* Bottom scroll hint */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-full text-xs text-slate-400">
          <span>Scroll or drag to explore</span>
          <div className="flex gap-1">
            <span className="w-4 h-4 border border-slate-600 rounded text-[10px] flex items-center justify-center">
              &larr;
            </span>
            <span className="w-4 h-4 border border-slate-600 rounded text-[10px] flex items-center justify-center">
              &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 border border-indigo-500/30 rounded-full text-sm text-indigo-200">
      {label}
      <button 
        onClick={onRemove}
        className="p-0.5 hover:bg-indigo-500/30 rounded-full transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
