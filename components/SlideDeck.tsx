import React, { useState, useEffect, useCallback } from 'react';
import { Slide, LessonPlan } from '../types';

interface SlideDeckProps {
  lessonPlan: LessonPlan;
  onReset: () => void;
}

export const SlideDeck: React.FC<SlideDeckProps> = ({ lessonPlan, onReset }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = lessonPlan.slides;
  const currentSlide = slides[currentIndex];

  const goToNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, slides.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  // Image URL construction using picsum
  const getImageUrl = (keyword: string, index: number) => {
    // Adding index/seed to ensure uniqueness if keywords are same
    return `https://picsum.photos/seed/${keyword.replace(/\s/g, '')}${index}/1920/1080`;
  };

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col">
      {/* Header / Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-20">
        <div>
          <h1 className="text-lg font-bold opacity-90">{lessonPlan.topic}</h1>
          <p className="text-xs opacity-60">{lessonPlan.audience}</p>
        </div>
        <div className="flex gap-3">
             <button 
              onClick={onReset}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm backdrop-blur-sm transition"
            >
              Exit
            </button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
           <img 
             src={getImageUrl(currentSlide.imageKeyword, currentIndex)} 
             alt="Background" 
             className="w-full h-full object-cover opacity-40"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Text Content */}
        <div className="relative z-10 max-w-5xl w-full px-8 md:px-16 py-12 animate-fadeIn">
          
          {/* Slide Count */}
          <div className="mb-4 text-blue-400 font-mono text-sm tracking-widest uppercase">
            Slide {currentIndex + 1} of {slides.length}
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight text-shadow-lg">
            {currentSlide.title}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Bullets */}
            <div className="lg:col-span-2 space-y-6">
              <ul className="space-y-4 text-xl md:text-2xl text-slate-200 font-light">
                {currentSlide.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-2 w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              {currentSlide.scriptureReference && (
                <div className="mt-8 inline-block p-4 bg-white/10 rounded-lg border-l-4 border-yellow-400 backdrop-blur-md">
                  <p className="font-serif italic text-yellow-100 text-lg">
                     📖 {currentSlide.scriptureReference}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar: Discussion or Activity */}
            <div className="lg:col-span-1">
              {currentSlide.discussionQuestion && (
                <div className="bg-blue-900/40 p-6 rounded-2xl border border-blue-500/30 backdrop-blur-sm">
                  <h3 className="text-blue-300 font-bold uppercase text-sm tracking-wider mb-3">
                    Discussion
                  </h3>
                  <p className="text-xl font-medium leading-relaxed text-white">
                    {currentSlide.discussionQuestion}
                  </p>
                </div>
              )}

              {/* Speaker Notes (Hidden in presenter mode usually, but showing small here for user visibility in this web app context) */}
              <div className="mt-6 opacity-50 hover:opacity-100 transition-opacity">
                <div className="text-[10px] uppercase tracking-wide mb-1">Teacher Notes</div>
                <p className="text-sm text-slate-300 italic">
                  {currentSlide.speakerNotes}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-black/80 backdrop-blur md:h-20 flex items-center justify-between px-8 py-4 z-20 border-t border-white/10">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="p-3 rounded-full hover:bg-white/10 disabled:opacity-30 transition"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Progress Dots */}
        <div className="flex gap-2 overflow-x-auto max-w-[50%]">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-blue-500' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          disabled={currentIndex === slides.length - 1}
          className="p-3 rounded-full hover:bg-white/10 disabled:opacity-30 transition"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};
