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

  // Image URL construction using Pollinations for generative AI images based on description
  const getImageUrl = (keyword: string) => {
    // Encoding the keyword allows us to pass full phrases like "colorful illustration of..."
    // We use nologo=true to keep it clean, and set a reasonable size for performance.
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(keyword)}?width=1280&height=720&nologo=true&model=flux`;
  };

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col">
      {/* Header / Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-20">
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
        <div className="absolute inset-0 z-0 bg-slate-900">
           {/* We use key={currentIndex} to force the image to unmount/remount for the fade effect */}
           <img 
             key={currentIndex}
             src={getImageUrl(currentSlide.imageKeyword)} 
             alt="Background" 
             className="w-full h-full object-cover opacity-60 animate-fadeIn"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        </div>

        {/* Text Content */}
        <div className="relative z-10 max-w-6xl w-full px-8 md:px-16 py-12 animate-fadeIn mt-8">
          
          {/* Slide Count */}
          <div className="mb-4 text-blue-400 font-mono text-sm tracking-widest uppercase">
            Slide {currentIndex + 1} of {slides.length}
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight text-shadow-lg drop-shadow-md">
            {currentSlide.title}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Questions (formerly bullets) */}
            <div className="lg:col-span-2 space-y-6">
              <ul className="space-y-6 text-xl md:text-3xl text-white font-medium">
                {currentSlide.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span className="mt-2 w-3 h-3 rounded-full bg-blue-400 shrink-0 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                    <span className="leading-snug drop-shadow-md">{bullet}</span>
                  </li>
                ))}
              </ul>

              {currentSlide.scriptureReference && (
                <div className="mt-10 inline-block p-5 bg-black/40 rounded-xl border-l-4 border-yellow-400 backdrop-blur-md">
                  <p className="font-serif italic text-yellow-100 text-lg tracking-wide">
                     📖 {currentSlide.scriptureReference}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar: Discussion or Activity */}
            <div className="lg:col-span-1">
              {currentSlide.discussionQuestion && (
                <div className="bg-blue-900/60 p-6 rounded-2xl border border-blue-500/40 backdrop-blur-md shadow-xl">
                  <h3 className="text-blue-200 font-bold uppercase text-xs tracking-wider mb-3">
                    Key Question
                  </h3>
                  <p className="text-2xl font-bold leading-relaxed text-white">
                    {currentSlide.discussionQuestion}
                  </p>
                </div>
              )}

              {/* Speaker Notes */}
              <div className="mt-8 p-4 rounded-lg hover:bg-black/40 transition-colors group cursor-help">
                <div className="text-[10px] uppercase tracking-wide mb-2 text-slate-400 group-hover:text-slate-300">Teacher Notes</div>
                <p className="text-sm text-slate-400 italic group-hover:text-slate-200">
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
        <div className="flex gap-2 overflow-x-auto max-w-[50%] px-4 no-scrollbar">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-12 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'w-2 bg-white/30 hover:bg-white/50'
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