import React, { useState } from 'react';
import type { User } from '../types';
import { login } from '../services/authService';
import { BrainCircuitIcon } from './Icons';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
        const user = login(email, password);
    
        if (user) {
          onLoginSuccess(user);
        } else {
          setError('Invalid email or password. Please try again.');
        }
        setIsLoading(false);
    }, 500); // Simulate network delay
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream p-4">
      <div className="text-center mb-8">
        <BrainCircuitIcon className="h-12 w-12 text-maroon mx-auto" />
        <h1 className="text-3xl md:text-4xl font-bold text-charcoal tracking-tight mt-4">
            Megatech's <span className="text-maroon">Creative Lab</span>
        </h1>
        <p className="text-warm-gray mt-2">Employee access only.</p>
      </div>
      
      <div className="w-full max-w-sm bg-beige p-8 rounded-2xl shadow-lg border border-dusty-rose">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-warm-gray mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-cream border border-dusty-rose rounded-lg p-3 text-charcoal focus:ring-2 focus:ring-gold focus:border-gold transition duration-200"
              placeholder="employee@megatech.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-warm-gray mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-cream border border-dusty-rose rounded-lg p-3 text-charcoal focus:ring-2 focus:ring-gold focus:border-gold transition duration-200"
              placeholder="••••••••"
            />
          </div>
          
          {error && <p className="text-sm text-maroon text-center">{error}</p>}
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold hover:bg-gold/90 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2 disabled:bg-warm-gray/50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
       <footer className="text-center text-warm-gray mt-12">
          <p>© MegaTech Solutions.</p>
      </footer>
    </div>
  );
};