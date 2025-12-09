import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Moon, 
  Sun, 
  CloudSun, 
  Coffee, 
  CheckCircle, 
  List, 
  Book, 
  Heart, 
  Shield, 
  Smile, 
  Share2, 
  Copy, 
  Volume2, 
  ChevronRight, 
  ArrowLeft,
  Home as HomeIcon,
  Sparkles,
  Square
} from 'lucide-react';
import { APP_DATA } from './data';
import { Category, Item, Section } from './types';

/**
 * --- CONTEXT & HOOKS ---
 */

interface AudioContextType {
  playingId: string | null;
  play: (id: string, text: string) => void;
  stop: () => void;
}

const AudioContext = createContext<AudioContextType>({
  playingId: null,
  play: () => {},
  stop: () => {},
});

const AudioProvider = ({ children }: { children?: React.ReactNode }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize voices
  useEffect(() => {
    const loadVoices = () => {
       window.speechSynthesis.getVoices();
    };
    loadVoices();
    // Some browsers need this event to populate voices
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Cleanup on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const stop = () => {
    window.speechSynthesis.cancel();
    setPlayingId(null);
    utteranceRef.current = null;
  };

  const play = (id: string, text: string) => {
    // If the same item is clicked, toggle stop
    if (playingId === id) {
      stop();
      return;
    }

    // Stop any currently playing audio
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance; // Keep reference to prevent garbage collection

    utterance.lang = 'ar-SA';
    utterance.rate = 0.85; // Slightly slower for clarity

    // Voice selection logic
    const voices = window.speechSynthesis.getVoices();
    // Prioritize Arabic voices (especially Google's if available as they are high quality)
    const arabicVoice = voices.find(v => v.lang.includes('ar') && v.name.includes('Google')) ||
                        voices.find(v => v.lang.includes('ar-SA')) || 
                        voices.find(v => v.lang.includes('ar'));
    
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onstart = () => {
      setPlayingId(id);
    };

    utterance.onend = () => {
      setPlayingId(null);
      utteranceRef.current = null;
    };

    utterance.onerror = (e) => {
      console.error("TTS Error:", e);
      setPlayingId(null);
      utteranceRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <AudioContext.Provider value={{ playingId, play, stop }}>
      {children}
    </AudioContext.Provider>
  );
};

/**
 * --- UTILS ---
 */
const getIconForCategory = (id: string, size = 24) => {
  switch (id) {
    case 'azkar_morning': return <Sun size={size} className="text-amber-500" />;
    case 'azkar_evening': return <Moon size={size} className="text-indigo-500" />;
    case 'azkar_sleep': return <CloudSun size={size} className="text-slate-500" />;
    case 'azkar_waking': return <Coffee size={size} className="text-orange-500" />;
    case 'azkar_prayer': return <CheckCircle size={size} className="text-emerald-500" />;
    case 'azkar_general': return <List size={size} className="text-teal-500" />;
    case 'dua_quran': return <BookOpen size={size} className="text-emerald-600" />;
    case 'dua_sunnah': return <Book size={size} className="text-green-600" />;
    case 'dua_rizq': return <Sparkles size={size} className="text-yellow-500" />;
    case 'dua_faraj': return <Shield size={size} className="text-blue-500" />;
    case 'dua_illness': return <Heart size={size} className="text-rose-500" />;
    case 'dua_general': return <Smile size={size} className="text-cyan-500" />;
    default: return <BookOpen size={size} className="text-islamic-600" />;
  }
};

/**
 * --- COMPONENTS ---
 */

const Header = ({ title, showBack = false }: { title: string, showBack?: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    // Explicitly determine parent path to avoid history stack issues
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 1) {
      // If we are at /section/category, go to /section
      navigate(`/${pathSegments[0]}`);
    } else {
      // If we are at /section or anywhere else, go home
      navigate('/');
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 h-16 flex items-center px-4
        ${isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-islamic-200' 
          : 'bg-white/60 backdrop-blur-sm border-b border-transparent shadow-sm'}`}
    >
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button 
              onClick={handleBack}
              className="p-2 -mr-2 rounded-full hover:bg-islamic-100 text-islamic-700 transition-colors active:scale-95"
              aria-label="رجوع"
            >
              <ArrowLeft size={24} />
            </button>
          ) : (
             <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300
               ${isScrolled ? 'bg-islamic-100 text-islamic-700' : 'bg-white text-islamic-600 shadow-sm'}`}>
               <BookOpen size={20} />
             </div>
          )}
          <h1 className={`text-xl font-bold font-sans tracking-wide transition-colors duration-300 
            ${isScrolled ? 'text-islamic-900' : 'text-islamic-800'}`}>
            {title}
          </h1>
        </div>
        {!showBack && (
          <div className="text-xs text-islamic-500 font-medium bg-islamic-50 px-2 py-1 rounded-md border border-islamic-100">
            v1.1
          </div>
        )}
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="py-8 text-center text-islamic-400 text-sm">
    <p>Made with <Heart size={12} className="inline text-rose-400 mx-1 fill-rose-400" /> by <span className="font-bold text-islamic-600">Yassen Ehab</span></p>
  </footer>
);

const ActionButton = ({ icon: Icon, label, onClick, variant = 'secondary' }: any) => {
  const baseClasses = "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95";
  const variants = {
    primary: "bg-islamic-600 text-white shadow-md hover:bg-islamic-700",
    secondary: "bg-islamic-50 text-islamic-700 hover:bg-islamic-100",
    outline: "border border-islamic-200 text-islamic-600 hover:bg-islamic-50"
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${variants[variant as keyof typeof variants]}`}>
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
};

const ContentCard = ({ item, type }: { item: Item, type: 'azkar' | 'adiyah' }) => {
  const [copied, setCopied] = useState(false);
  
  // Use global audio context
  const { playingId, play, stop } = useContext(AudioContext);
  const isPlaying = playingId === item.id;

  const handleCopy = () => {
    navigator.clipboard.writeText(item.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(item.text + '\n\n' + '- من تطبيق ذكّرني')}`;
    window.open(url, '_blank');
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert("عذراً، متصفحك لا يدعم القراءة الصوتية");
      return;
    }
    
    if (isPlaying) {
      stop();
    } else {
      play(item.id, item.text);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-islamic-100 hover:shadow-md transition-shadow duration-300 animate-slide-up group relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute -top-10 -left-10 w-24 h-24 bg-islamic-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out"></div>
      
      <div className="relative z-10">
        <p className="text-xl md:text-2xl leading-loose font-serif text-slate-800 mb-6 text-center select-text">
          {item.text}
        </p>

        {item.source && (
          <p className="text-sm text-islamic-500 mb-4 text-center font-medium opacity-80">
            — {item.source}
          </p>
        )}
        
        {item.note && (
          <div className="bg-amber-50 border-r-4 border-amber-300 p-3 mb-4 rounded-l-lg text-sm text-amber-800">
            {item.note}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
           {item.count && type === 'azkar' && (
             <div className="flex items-center gap-2 bg-islamic-50 px-3 py-1 rounded-full">
               <span className="text-xs text-islamic-400">التكرار</span>
               <span className="text-lg font-bold text-islamic-600">{item.count}</span>
             </div>
           )}

           <div className="flex items-center gap-2 mr-auto">
             {type === 'azkar' && (
               <ActionButton 
                 icon={isPlaying ? Square : Volume2} 
                 label={isPlaying ? "إيقاف" : "استماع"} 
                 onClick={handleSpeak}
                 variant={isPlaying ? "primary" : "secondary"}
                />
             )}
             
             <ActionButton 
               icon={copied ? CheckCircle : Copy} 
               label={copied ? "تم النسخ" : "نسخ"} 
               onClick={handleCopy}
               variant="secondary"
             />

             {type === 'adiyah' && (
               <ActionButton 
                 icon={Share2} 
                 label={isPlaying ? "مشاركة" : "مشاركة"} 
                 onClick={handleShare}
                 variant="outline"
               />
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

const CategoryCard = ({ category, onClick }: { category: Category, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-islamic-100 w-full text-right flex items-center justify-between group animate-slide-up"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-islamic-50 group-hover:bg-islamic-100 flex items-center justify-center transition-colors text-islamic-600">
        {getIconForCategory(category.id)}
      </div>
      <div>
        <h3 className="font-bold text-lg text-gray-800 group-hover:text-islamic-700 transition-colors">{category.title}</h3>
        <p className="text-sm text-gray-400 mt-1">{category.items.length} ذكر/دعاء</p>
      </div>
    </div>
    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-islamic-500 group-hover:text-white transition-all">
      <ChevronRight size={18} className="rotate-180" />
    </div>
  </button>
);

/**
 * --- PAGES ---
 */

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="ذكّرني" />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 -right-20 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-30 -z-10"></div>
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-cyan-100 rounded-full blur-3xl opacity-30 -z-10"></div>

        <div className="text-center mb-12 max-w-lg">
          <h2 className="text-3xl font-serif font-bold text-islamic-800 mb-4">أَلا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ</h2>
          <p className="text-islamic-600 text-lg">مرحباً بك في واحتك اليومية للذكر والدعاء</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <button 
            onClick={() => navigate('/azkar')}
            className="group relative bg-white overflow-hidden rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-emerald-100"
          >
            <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-l from-emerald-400 to-teal-400"></div>
            <div className="flex flex-col items-center gap-6 z-10 relative">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                <Sun size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 group-hover:text-emerald-700">قسم الأذكار</h3>
              <p className="text-gray-500 text-sm">أذكار الصباح، المساء، النوم وغيرها</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/adiyah')}
            className="group relative bg-white overflow-hidden rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-cyan-100"
          >
             <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-l from-cyan-400 to-blue-400"></div>
            <div className="flex flex-col items-center gap-6 z-10 relative">
              <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform duration-300">
                <BookOpen size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 group-hover:text-cyan-700">قسم الأدعية</h3>
              <p className="text-gray-500 text-sm">أدعية من القرآن والسنة</p>
            </div>
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const SectionCategoriesPage = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const sectionData = APP_DATA.find(s => s.id === sectionId);

  if (!sectionData) return <div className="p-10 text-center">القسم غير موجود</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-white">
      <Header title={sectionData.title} showBack />
      
      <main className="max-w-2xl mx-auto p-4 md:p-6 pb-20">
        <div className="mb-8 text-center animate-fade-in">
           <h2 className="text-xl font-medium text-islamic-700">{sectionData.description}</h2>
        </div>

        <div className="grid gap-4">
          {sectionData.categories.map((cat, idx) => (
            <div key={cat.id} style={{ animationDelay: `${idx * 0.1}s` }} className="animate-slide-up">
                <CategoryCard 
                    category={cat} 
                    onClick={() => navigate(`/${sectionId}/${cat.id}`)} 
                />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const ItemsListPage = () => {
  const { sectionId, categoryId } = useParams();
  const section = APP_DATA.find(s => s.id === sectionId);
  const category = section?.categories.find(c => c.id === categoryId);
  
  // Ref for scrolling to top on load
  const topRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (!category || !section) return <div className="p-10 text-center">المحتوى غير موجود</div>;

  return (
    <div className="min-h-screen bg-slate-50" ref={topRef}>
      <Header title={category.title} showBack />
      
      <main className="max-w-2xl mx-auto p-4 md:p-6 pb-20">
        <div className="flex flex-col gap-6">
          {category.items.map((item, idx) => (
            <div key={item.id} style={{ animationDelay: `${idx * 0.1}s` }} className="animate-slide-up">
              <ContentCard 
                item={item} 
                type={sectionId as 'azkar' | 'adiyah'} 
              />
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center text-islamic-400 text-sm animate-pulse">
            <p>انتهى المحتوى</p>
        </div>
      </main>
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  return (
    <AudioProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:sectionId" element={<SectionCategoriesPage />} />
          <Route path="/:sectionId/:categoryId" element={<ItemsListPage />} />
        </Routes>
      </HashRouter>
    </AudioProvider>
  );
};

export default App;