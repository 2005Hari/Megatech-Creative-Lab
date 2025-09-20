import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { Login } from './components/Login';
import { generateCreative } from './services/geminiService';
import { getCurrentUser, logout } from './services/authService';
import type { CreativeOutput, CreativeType, HistoryItem, User } from './types';
import { DownloadIcon, LayoutGridIcon } from './components/Icons';

type View = 'generator' | 'library';

// DashboardStats Component
const DashboardStats: React.FC<{ history: HistoryItem[] }> = ({ history }) => {
  const today = new Date().toDateString();
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const createdToday = history.filter(item => new Date(item.createdAt).toDateString() === today).length;
  const createdThisWeek = history.filter(item => new Date(item.createdAt) >= startOfWeek).length;

  return (
    <div className="mb-8 bg-beige border border-dusty-rose rounded-xl p-4 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-maroon">{createdToday}</p>
          <p className="text-sm text-warm-gray">Created Today</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-maroon">{createdThisWeek}</p>
          <p className="text-sm text-warm-gray">Created This Week</p>
        </div>
        <div className="col-span-2 md:col-span-1">
          <p className="text-2xl font-bold text-maroon">{history.length}</p>
          <p className="text-sm text-warm-gray">Total in Library</p>
        </div>
      </div>
    </div>
  );
};

// LibraryView Component
const LibraryView: React.FC<{ items: HistoryItem[] }> = ({ items }) => {
  const handleDownload = (item: HistoryItem) => {
    const link = document.createElement('a');
    link.href = item.visualUrl;
    link.download = `${item.json.headline.replace(/\s+/g, '_').toLowerCase()}_creative.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <LayoutGridIcon className="h-16 w-16 mx-auto text-dusty-rose mb-4" />
        <h2 className="text-2xl font-bold text-maroon">Your Library is Empty</h2>
        <p className="text-warm-gray mt-2">Start by generating a new creative from the dashboard.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {[...items].reverse().map(item => (
        <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg border border-dusty-rose bg-beige shadow-sm transition-shadow hover:shadow-md">
          <img src={item.visualUrl} alt={item.json.headline} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/40 to-transparent p-3 flex flex-col justify-end">
            <p className="font-bold text-white text-sm translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 line-clamp-2">{item.json.headline}</p>
            <p className="text-xs text-cream/80 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100">{new Date(item.createdAt).toLocaleDateString()}</p>
          </div>
          <button
            onClick={() => handleDownload(item)}
            className="absolute top-2 right-2 bg-charcoal/60 p-2 rounded-full text-white hover:bg-gold transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Download creative"
          >
            <DownloadIcon className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
};


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [view, setView] = useState<View>('generator');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<CreativeOutput | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (user) {
      try {
        const storedHistory = localStorage.getItem(`creativeHistory_${user.email}`);
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      } catch (e) {
        console.error("Failed to load history from localStorage", e);
      }
    }
  }, [user]);
  
  const addCreativeToHistory = (newOutput: CreativeOutput, userInput: string, occasion: string, creativeType: CreativeType) => {
      if (!user) return;
      const newHistoryItem: HistoryItem = {
          ...newOutput,
          id: self.crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          creativeType,
          userInput,
          occasion,
      };

      setHistory(prevHistory => {
          const updatedHistory = [...prevHistory, newHistoryItem];
          try {
              localStorage.setItem(`creativeHistory_${user.email}`, JSON.stringify(updatedHistory));
          } catch(e) {
              console.error("Failed to save history to localStorage", e);
          }
          return updatedHistory;
      });
  };

  const handleSubmit = useCallback(async (userInput: string, occasion: string, creativeType: CreativeType, imageFile: File | null) => {
    if (!userInput.trim() && !imageFile && !occasion.trim()) {
      setError('Please provide product information, an occasion, or a reference image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutput(null);

    try {
      const result = await generateCreative(userInput, occasion, creativeType, imageFile);
      setOutput(result);
      addCreativeToHistory(result, userInput, occasion, creativeType);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };
  
  const handleLogout = () => {
    logout();
    setUser(null);
    setHistory([]);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-cream text-charcoal font-sans">
      <Header onNavigate={setView} currentView={view} user={user} onLogout={handleLogout} />
      <main className="container mx-auto p-4 md:p-8">
        {view === 'generator' ? (
           <>
            <DashboardStats history={history} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="bg-beige p-6 rounded-2xl shadow-lg border border-dusty-rose">
                <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
              </div>
              <div className="bg-beige p-6 rounded-2xl shadow-lg border border-dusty-rose min-h-[300px] flex items-center justify-center">
                <OutputDisplay 
                  output={output} 
                  isLoading={isLoading} 
                  loadingMessage="Generating creative..." 
                  error={error} 
                />
              </div>
            </div>
           </>
        ) : (
          <LibraryView items={history} />
        )}
        <footer className="text-center text-warm-gray mt-12">
          <p>Designed for MegaTech Solutions.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;