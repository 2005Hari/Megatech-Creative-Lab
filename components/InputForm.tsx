import React, { useState, useRef, useEffect } from 'react';
import type { CreativeType } from '../types';
import { UploadIcon, TrashIcon } from './Icons';

interface InputFormProps {
  onSubmit: (userInput: string, occasion: string, creativeType: CreativeType, imageFile: File | null) => void;
  isLoading: boolean;
}

const creativeTypes: { value: CreativeType, label: string }[] = [
    { value: 'instagram_post', label: 'Instagram Post (1:1)' },
    { value: 'whatsapp_story', label: 'WhatsApp Story (9:16)' },
    { value: 'linkedin_post', label: 'LinkedIn Post (4:3)' },
    { value: 'banner', label: 'Web Banner (16:9)' },
    { value: 'brochure', label: 'Brochure/Flyer (3:4)' },
];

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [userInput, setUserInput] = useState('New 8-channel CCTV, night vision, ₹4999, 30% launch discount, contact 9561269819');
  const [occasion, setOccasion] = useState('');
  const [creativeType, setCreativeType] = useState<CreativeType>('instagram_post');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(userInput, occasion, creativeType, imageFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="creativeType" className="block text-sm font-medium text-warm-gray mb-2">
          Creative Type
        </label>
        <select
          id="creativeType"
          value={creativeType}
          onChange={(e) => setCreativeType(e.target.value as CreativeType)}
          className="w-full bg-cream border border-dusty-rose rounded-lg p-3 text-charcoal focus:ring-2 focus:ring-gold focus:border-gold transition duration-200"
        >
          {creativeTypes.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="userInput" className="block text-sm font-medium text-warm-gray mb-2">
          Product / Service / Prompt
        </label>
        <textarea
          id="userInput"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          rows={4}
          className="w-full bg-cream border border-dusty-rose rounded-lg p-3 text-charcoal focus:ring-2 focus:ring-gold focus:border-gold transition duration-200"
          placeholder="e.g., New 8-channel CCTV, night vision, ₹4999..."
        />
      </div>

      <div>
        <label htmlFor="occasion" className="block text-sm font-medium text-warm-gray mb-2">
          Occasion / Festival (Optional)
        </label>
        <input
          type="text"
          id="occasion"
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          className="w-full bg-cream border border-dusty-rose rounded-lg p-3 text-charcoal focus:ring-2 focus:ring-gold focus:border-gold transition duration-200"
          placeholder="e.g., Diwali, Christmas, New Year"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-warm-gray mb-2">
          Reference Image (Optional)
        </label>
        {imagePreview ? (
          <div className="relative group">
            <img src={imagePreview} alt="Reference preview" className="w-full h-48 object-contain bg-cream rounded-lg border border-dusty-rose" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-charcoal/60 p-2 rounded-full text-white hover:bg-maroon transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Remove image"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-dusty-rose rounded-lg text-warm-gray hover:border-gold hover:text-gold transition-colors duration-200"
            >
              <UploadIcon className="h-8 w-8 mb-2" />
              <span className="text-sm font-semibold">Click to upload an image</span>
              <span className="text-xs">PNG, JPG, WEBP, etc.</span>
            </button>
            <input
              type="file"
              id="imageUpload"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
          </>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gold hover:bg-gold/90 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2 disabled:bg-warm-gray/50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate Creative'}
        </button>
      </div>
    </form>
  );
};