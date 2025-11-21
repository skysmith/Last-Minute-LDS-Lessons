import React, { useState } from 'react';
import { Audience, LessonPlan, GenerationStatus } from './types';
import { formatDate } from './constants';
import { identifyLesson, generateSlides } from './services/geminiService';
import { SetupForm } from './components/SetupForm';
import { SlideDeck } from './components/SlideDeck';

const App: React.FC = () => {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleGenerate = async (date: Date, audience: Audience) => {
    try {
      setErrorMsg(null);
      setStatus('identifying-lesson');
      setStatusMessage(`Identifying lesson for ${formatDate(date)}...`);
      
      const dateStr = formatDate(date);
      const lessonInfo = await identifyLesson(dateStr);

      setStatus('generating-slides');
      setStatusMessage(`Creating ${audience} slides for "${lessonInfo.title}"...`);

      const slides = await generateSlides(lessonInfo.context, audience);

      const newPlan: LessonPlan = {
        topic: lessonInfo.title,
        date: dateStr,
        audience: audience,
        slides: slides,
        sources: lessonInfo.sources
      };

      setLessonPlan(newPlan);
      setStatus('complete');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || "Something went wrong while creating the lesson.");
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setLessonPlan(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header is only visible when not presenting */}
      {status !== 'complete' && (
        <header className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Come Follow Me - Last Minute Lesson Plans
              </h1>
            </div>
            <a href="https://www.churchofjesuschrist.org/study/come-follow-me" target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
              Come, Follow Me Resources &rarr;
            </a>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={status === 'complete' ? 'h-screen' : 'max-w-6xl mx-auto p-4 md:p-8'}>
        
        {status === 'idle' && (
          <div className="fade-in">
             <div className="text-center py-12 max-w-2xl mx-auto">
               <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Instant Lesson Plans</h2>
               <p className="text-lg text-slate-600 mb-8">
                 Combine the power of AI with the spirit of the Come, Follow Me curriculum. 
                 Automatically generate beautiful slide decks for your Primary, Youth, or Adult classes.
               </p>
             </div>
             <SetupForm onGenerate={handleGenerate} isGenerating={false} />
          </div>
        )}

        {(status === 'identifying-lesson' || status === 'generating-slides') && (
           <div className="flex flex-col items-center justify-center min-h-[60vh] text-center fade-in">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Please Wait</h3>
              <p className="text-slate-500 text-lg animate-pulse">{statusMessage}</p>
           </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center fade-in">
             <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-4xl mb-6">⚠️</div>
             <h3 className="text-2xl font-bold text-slate-800 mb-2">Generation Failed</h3>
             <p className="text-red-600 max-w-md mb-8">{errorMsg}</p>
             <button 
               onClick={handleReset}
               className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-semibold transition shadow-lg"
             >
               Try Again
             </button>
          </div>
        )}

        {status === 'complete' && lessonPlan && (
          <SlideDeck lessonPlan={lessonPlan} onReset={handleReset} />
        )}

      </main>

      {/* Footer (only when not presenting) */}
      {status !== 'complete' && (
        <footer className="text-center py-8 text-slate-400 text-sm">
          <p>Not an official product of The Church of Jesus Christ of Latter-day Saints.</p>
          <p className="mt-2">Powered by Gemini AI.</p>
        </footer>
      )}
    </div>
  );
};

export default App;