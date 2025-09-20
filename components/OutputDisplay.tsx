import React from 'react';
import type { CreativeOutput } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { SparklesIcon, WarningIcon, DownloadIcon, ShareIcon } from './Icons';

interface OutputDisplayProps {
  output: CreativeOutput | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ output, isLoading, loadingMessage, error }) => {
  const handleDownload = () => {
    if (!output) return;
    const link = document.createElement('a');
    link.href = output.visualUrl;
    link.download = `${output.json.headline.replace(/\s+/g, '_').toLowerCase()}_creative.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!output || !navigator.share) {
      alert('Web Share API is not supported in your browser.');
      return;
    }
    try {
        const response = await fetch(output.visualUrl);
        const blob = await response.blob();
        const file = new File([blob], `${output.json.headline.replace(/\s+/g, '_').toLowerCase()}_creative.jpg`, { type: 'image/jpeg' });

        await navigator.share({
            title: `Creative: ${output.json.headline}`,
            text: `${output.json.subtext}`,
            files: [file],
        });
    } catch (err) {
        console.error('Error sharing:', err);
    }
  };


  if (isLoading) {
    return (
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gold animate-pulse">{loadingMessage}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-maroon">
        <WarningIcon className="h-12 w-12 mx-auto mb-2" />
        <p className="font-semibold">Generation Failed</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="text-center text-warm-gray">
        <SparklesIcon className="h-12 w-12 mx-auto mb-2 text-dusty-rose" />
        <p>Your generated creative will appear here.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="aspect-square bg-beige rounded-lg overflow-hidden border border-dusty-rose flex items-center justify-center">
        <img src={output.visualUrl} alt="Generated Creative" className="w-full h-full object-contain" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
          <button onClick={handleDownload} className="flex items-center justify-center gap-2 w-full bg-dusty-rose hover:bg-dusty-rose/80 text-charcoal font-bold py-2 px-4 rounded-lg transition duration-300">
            <DownloadIcon className="h-5 w-5" />
            Download
          </button>
          {navigator.share && (
            <button onClick={handleShare} className="flex items-center justify-center gap-2 w-full bg-dusty-rose hover:bg-dusty-rose/80 text-charcoal font-bold py-2 px-4 rounded-lg transition duration-300">
              <ShareIcon className="h-5 w-5" />
              Share
            </button>
          )}
      </div>

      <div className="bg-beige p-4 rounded-lg border border-dusty-rose max-h-48 overflow-y-auto">
        <pre className="text-xs text-warm-gray whitespace-pre-wrap break-words">
          {JSON.stringify(output.json, null, 2)}
        </pre>
      </div>
    </div>
  );
};