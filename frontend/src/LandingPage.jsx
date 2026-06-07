import React, { useState } from 'react';
import API from './api/axios';
import GamePage from './GamePage';
import Loader from './Loader';

const PRESET_THEMES = [
  { id: 'haunted', name: 'Haunted', desc: 'Cursed locations & paranormal activity', icon: '👻' },
  { id: 'kidnapped', name: 'Kidnapped', desc: 'Ransom letters & secret abductions', icon: '👤' },
  { id: 'murder', name: 'Murder Mystery', desc: 'Classic whodunits & cold-blooded acts', icon: '🩸' },
  { id: 'heist', name: 'Heritage Heist', desc: 'Stolen relics & historic museum break-ins', icon: '🏛️' },
  { id: 'royal', name: 'Royal Betrayal', desc: 'Poisoned heirs & dynastic palace secrets', icon: '👑' },
  { id: 'cyber', name: 'Cyber Sabotage', desc: 'Hacks, trace hunts & corporate spy codes', icon: '💻' },
  { id: 'train', name: 'Train Robbery', desc: 'High-stakes theft aboard luxury express trains', icon: '🚂' },
  { id: 'bio', name: 'Bio-Hazard', desc: 'Secret leaks & toxic biological sabotage', icon: '🧪' },
];

const LandingPage = () => {
  const [loading, setLoading] = useState(false);
  const [context_ID, setContext_ID] = useState('');
  const [game, setGame] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('Murder Mystery');
  const [customTheme, setCustomTheme] = useState('');

  const handleSelectPreset = (themeName) => {
    setSelectedPreset(themeName);
    setCustomTheme(''); // Clear custom theme when a preset is selected
  };

  const handleCustomChange = (e) => {
    setCustomTheme(e.target.value);
    setSelectedPreset(''); // Clear preset selection when custom text is typed
  };

  const handlePlayAgain = () => {
    setGame(false);
    setContext_ID('');
  };

  const startGame = async () => {
    const finalTheme = customTheme.trim() || selectedPreset || 'Murder Mystery';
    setLoading(true);
    
    try {
      const res = await API.post('/api/v1/', {
        theme: finalTheme,
        character_count: 4
      });
      setLoading(false);
      setContext_ID(res.data?.data._id);
      setGame(true);
    } catch (error) {
      setLoading(false);
      console.log('failed:', error.response?.data || error.message);
    }
  };

  if (loading) {
    return <Loader />;
  } else if (game) {
    return <GamePage context_ID={context_ID} onPlayAgain={handlePlayAgain} />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[url('/d1.png')] bg-no-repeat bg-cover bg-center py-10 px-4">
      {/* Light cream manila file overlay card */}
      <div className="w-full max-w-5xl bg-amber-50 border border-stone-300 p-6 sm:p-10 rounded-lg shadow-2xl flex flex-col items-center">
        
        {/* Title */}
        <h1 className="text-5xl sm:text-6xl special-elite-regular font-bold text-red-950 mb-2 tracking-wide text-center drop-shadow-sm">
          AImposter
        </h1>
        <h5 className="text-xl sm:text-2xl special-elite-regular text-stone-700 font-semibold mb-8 text-center px-4">
          Every character has a story. One of them is fiction.
        </h5>

        {/* Info / How To Play Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b border-dashed border-stone-300 pb-8">
          <div className="bg-white p-5 rounded-md border border-stone-200 shadow-sm flex flex-col items-center text-center">
            <span className="text-3xl mb-2">📜</span>
            <h4 className="text-red-900 font-serif font-bold text-lg mb-1">1. Choose a Theme</h4>
            <p className="text-stone-600 text-sm leading-relaxed">
              Select one of our preset mystery cases or type your own custom story theme.
            </p>
          </div>
          <div className="bg-white p-5 rounded-md border border-stone-200 shadow-sm flex flex-col items-center text-center">
            <span className="text-3xl mb-2">💬</span>
            <h4 className="text-red-900 font-serif font-bold text-lg mb-1">2. Interrogate Suspects</h4>
            <p className="text-stone-600 text-sm leading-relaxed">
              Chat with each suspect. The innocents speak truth, but the Imposter will lie to cover up.
            </p>
          </div>
          <div className="bg-white p-5 rounded-md border border-stone-200 shadow-sm flex flex-col items-center text-center">
            <span className="text-3xl mb-2">🔍</span>
            <h4 className="text-red-900 font-serif font-bold text-lg mb-1">3. Solve the Case</h4>
            <p className="text-stone-600 text-sm leading-relaxed">
              Deduct discrepancies, make your final accusation, and uncover the real truth.
            </p>
          </div>
        </div>

        {/* Theme Selector Section */}
        <div className="w-full flex flex-col items-center mb-8">
          <h3 className="text-2xl font-serif text-stone-800 font-bold mb-5 self-start px-2">
            Select Case File Theme
          </h3>
          
          {/* Presets Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {PRESET_THEMES.map((theme) => {
              const isActive = selectedPreset === theme.name;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectPreset(theme.name)}
                  className={`p-4 rounded-md border text-left flex flex-col justify-between h-32 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md
                    ${isActive 
                      ? 'bg-amber-100/60 border-red-900/80 shadow-md ring-2 ring-red-900/20' 
                      : 'bg-white border-stone-200 hover:bg-stone-50 hover:border-stone-300'
                    }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl">{theme.icon}</span>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-red-900 animate-ping"></span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold font-serif text-red-950 text-base mb-1">{theme.name}</h4>
                    <p className="text-xs text-stone-500 leading-tight line-clamp-2">{theme.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Theme Box */}
          <div className="w-full bg-white p-4 rounded-md border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label htmlFor="custom-theme" className="block text-xs font-serif text-stone-500 mb-1 pl-1">
                Or craft your own mystery case theme...
              </label>
              <input
                id="custom-theme"
                type="text"
                placeholder="e.g. Heist during a wedding, Bollywood train robbery, Cursed diamond..."
                value={customTheme}
                onChange={handleCustomChange}
                className="w-full h-11 px-4 bg-stone-50 border border-stone-300 rounded-md text-stone-850 placeholder:text-stone-400 focus:outline-none focus:border-red-900 transition-colors text-sm"
              />
            </div>
            {customTheme.trim() !== '' && (
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className="h-2 w-2 rounded-full bg-red-900 animate-ping"></span>
                <span className="text-xs font-serif text-red-900 font-bold uppercase tracking-wider">Custom Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Investigate Button */}
        <button
          type="button"
          onClick={startGame}
          className="px-10 py-4 text-lg font-serif font-bold uppercase tracking-wider text-amber-100 bg-stone-800 hover:bg-stone-700 hover:scale-105 active:scale-95 transition-all duration-200 rounded-md shadow-md"
        >
          Begin Investigation
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
