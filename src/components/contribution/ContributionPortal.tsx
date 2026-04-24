"use client";

import React, { useState } from 'react';
import { UploadZone } from './UploadZone';
import { 
  X, 
  Upload, 
  Eye, 
  EyeOff, 
  Users, 
  Lock,
  ChevronRight,
  Check,
  Image as ImageIcon,
  MessageCircle
} from 'lucide-react';

interface ContributionPortalProps {
  isOpen: boolean;
  onClose: () => void;
  memorialName?: string;
}

type Step = 'upload' | 'details' | 'confirm';
type Visibility = 'public' | 'family' | 'admin';

interface UploadData {
  files: File[];
  visibility: Visibility;
  message: string;
  contributorName: string;
  contributorRelation: string;
}

export function ContributionPortal({ isOpen, onClose, memorialName = "Memorial" }: ContributionPortalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [uploadData, setUploadData] = useState<UploadData>({
    files: [],
    visibility: 'public',
    message: '',
    contributorName: '',
    contributorRelation: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleFilesSelected = (files: File[]) => {
    setUploadData(prev => ({
      ...prev,
      files: [...prev.files, ...files],
    }));
  };

  const handleNext = () => {
    if (step === 'upload') {
      if (uploadData.files.length === 0) {
        alert('Please select at least one file');
        return;
      }
      setStep('details');
    } else if (step === 'details') {
      if (!uploadData.contributorName.trim()) {
        alert('Please enter your name');
        return;
      }
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'details') setStep('upload');
    if (step === 'confirm') setStep('details');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    
    // Reset after success
    setTimeout(() => {
      setSubmitSuccess(false);
      setUploadData({
        files: [],
        visibility: 'public',
        message: '',
        contributorName: '',
        contributorRelation: '',
      });
      setStep('upload');
      onClose();
    }, 3000);
  };

  const visibilityOptions: { value: Visibility; label: string; description: string; icon: React.ReactNode }[] = [
    {
      value: 'public',
      label: 'Public Wall',
      description: 'Visible to everyone who visits the memorial',
      icon: <Eye className="w-5 h-5" />,
    },
    {
      value: 'family',
      label: 'Family Only',
      description: 'Only visible to invited family members',
      icon: <Users className="w-5 h-5" />,
    },
    {
      value: 'admin',
      label: 'Private Review',
      description: 'Only visible to memorial administrators',
      icon: <Lock className="w-5 h-5" />,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-semibold text-white">Contribute to {memorialName}</h2>
            <p className="text-sm text-slate-400 mt-1">Share photos, videos, and memories</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 px-6 py-4 bg-slate-800/50">
          {(['upload', 'details', 'confirm'] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${
                step === s 
                  ? 'text-indigo-400' 
                  : i < ['upload', 'details', 'confirm'].indexOf(step)
                    ? 'text-green-400'
                    : 'text-slate-500'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s 
                    ? 'bg-indigo-500/20 border border-indigo-500' 
                    : i < ['upload', 'details', 'confirm'].indexOf(step)
                      ? 'bg-green-500/20 border border-green-500'
                      : 'bg-slate-700/50 border border-slate-600'
                }`}>
                  {i < ['upload', 'details', 'confirm'].indexOf(step) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-sm font-medium capitalize hidden sm:inline">{s}</span>
              </div>
              {i < 2 && (
                <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {submitSuccess ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Thank You!</h3>
              <p className="text-slate-400">
                Your contribution has been submitted successfully.
                {uploadData.visibility !== 'public' && ' It will be reviewed by the memorial administrator.'}
              </p>
            </div>
          ) : step === 'upload' ? (
            <UploadZone onFilesSelected={handleFilesSelected} />
          ) : step === 'details' ? (
            <div className="space-y-6">
              {/* Contributor Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-400">Your Information</h3>
                
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Your Name *</label>
                  <input
                    type="text"
                    value={uploadData.contributorName}
                    onChange={(e) => setUploadData(prev => ({ ...prev, contributorName: e.target.value }))}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Relationship</label>
                  <select
                    value={uploadData.contributorRelation}
                    onChange={(e) => setUploadData(prev => ({ ...prev, contributorRelation: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select relationship (optional)</option>
                    <option value="spouse">Spouse/Partner</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="grandchild">Grandchild</option>
                    <option value="friend">Friend</option>
                    <option value="colleague">Colleague</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Visibility */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-400">Who can see this?</h3>
                
                <div className="space-y-2">
                  {visibilityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setUploadData(prev => ({ ...prev, visibility: option.value }))}
                      className={`w-full flex items-start gap-4 p-4 rounded-lg border transition-all text-left ${
                        uploadData.visibility === option.value
                          ? 'bg-indigo-500/10 border-indigo-500'
                          : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className={`flex-shrink-0 ${
                        uploadData.visibility === option.value ? 'text-indigo-400' : 'text-slate-500'
                      }`}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          uploadData.visibility === option.value ? 'text-white' : 'text-slate-300'
                        }`}>
                          {option.label}
                        </p>
                        <p className="text-sm text-slate-500 mt-0.5">{option.description}</p>
                      </div>
                      {uploadData.visibility === option.value && (
                        <Check className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Message */}
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  Add a message (optional)
                </label>
                <textarea
                  value={uploadData.message}
                  onChange={(e) => setUploadData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Share a memory or story about these photos..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
          ) : (
            /* Confirm step */
            <div className="space-y-6">
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold text-white mb-2">Review Your Contribution</h3>
                <p className="text-sm text-slate-400">Please confirm the details before submitting</p>
              </div>

              <div className="space-y-4 bg-slate-800/30 rounded-lg p-4">
                <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                  <span className="text-slate-400">Files</span>
                  <span className="text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {uploadData.files.length} file(s)
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                  <span className="text-slate-400">Contributor</span>
                  <span className="text-white">{uploadData.contributorName}</span>
                </div>
                
                {uploadData.contributorRelation && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                    <span className="text-slate-400">Relationship</span>
                    <span className="text-white capitalize">{uploadData.contributorRelation}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                  <span className="text-slate-400">Visibility</span>
                  <span className="text-white flex items-center gap-2">
                    {visibilityOptions.find(v => v.value === uploadData.visibility)?.icon}
                    {visibilityOptions.find(v => v.value === uploadData.visibility)?.label}
                  </span>
                </div>
                
                {uploadData.message && (
                  <div className="py-2">
                    <span className="text-slate-400 block mb-2">Message</span>
                    <p className="text-white text-sm bg-slate-900/50 p-3 rounded-lg">
                      {uploadData.message}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 text-center">
                By submitting, you confirm that you have the right to share these files 
                and that they comply with community guidelines.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!submitSuccess && (
          <div className="flex items-center justify-between p-6 border-t border-slate-800 bg-slate-900/50">
            <button
              onClick={step === 'upload' ? onClose : handleBack}
              className="px-6 py-2.5 text-slate-400 hover:text-white transition-colors"
            >
              {step === 'upload' ? 'Cancel' : 'Back'}
            </button>
            
            <button
              onClick={step === 'confirm' ? handleSubmit : handleNext}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                isSubmitting
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : step === 'confirm' ? (
                <>
                  <Upload className="w-4 h-4" />
                  Submit Contribution
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
