import React, { useState, useEffect, useCallback } from 'react';
import PptxGenJS from 'pptxgenjs';
import { Slide, LessonPlan } from '../types';

interface SlideDeckProps {
  lessonPlan: LessonPlan;
  onReset: () => void;
}

export const SlideDeck: React.FC<SlideDeckProps> = ({ lessonPlan, onReset }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSources, setShowSources] = useState(false);
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
      if (showSources) {
        if (e.key === 'Escape') setShowSources(false);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, showSources]);

  // Reset image error state when slide changes
  useEffect(() => {
    setImgError(false);
  }, [currentIndex]);

  // Image URL construction using Pollinations for generative AI images based on description
  const getImageUrl = (keyword: string) => {
    // We removed 'model=flux' to allow the provider to use the fastest available model (usually Turbo or default).
    // This improves reliability significantly.
    // We encode the keyword to ensure special characters don't break the URL.
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(keyword)}?width=1280&height=720&nologo=true`;
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const pres = new PptxGenJS();
      pres.layout = 'LAYOUT_16x9';
      pres.title = lessonPlan.topic;
      pres.subject = `Come Follow Me - ${lessonPlan.audience}`;

      // Loop through slides and add to PPTX
      for (const s of slides) {
        const slide = pres.addSlide();
        
        // Background Image
        // PptxGenJS can fetch the image from the URL and embed it.
        slide.background = { path: getImageUrl(s.imageKeyword) };
        
        // Dark Overlay (Simulated with a semi-transparent rectangle)
        // This ensures white text is readable over the image.
        slide.addShape(pres.ShapeType.rect, { 
          x: 0, y: 0, w: '100%', h: '100%', 
          fill: { color: '000000', transparency: 40 } 
        });

        // Title
        slide.addText(s.title, {
          x: 0.5, y: 0.5, w: '90%', h: 1.5,
          fontSize: 36,
          fontFace: 'Arial',
          color: 'FFFFFF',
          bold: true,
          shadow: { type: 'outer', color: '000000', blur: 5, offset: 2, opacity: 0.5 }
        });

        // Bullets / Questions
        const bulletItems = s.bullets.map(b => ({
          text: b,
          options: {
            fontSize: 20,
            color: 'FFFFFF',
            breakLine: true,
            bullet: true,
            paraSpaceBefore: 10
          }
        }));

        slide.addText(bulletItems, {
          x: 0.5, y: 2.0, w: '85%', h: 4.0,
          fontFace: 'Arial',
          valign: 'top'
        });

        // Scripture Reference
        if (s.scriptureReference) {
          slide.addText(`📖 ${s.scriptureReference}`, {
            x: 0.5, y: 6.2, w: '90%', h: 0.6,
            fontSize: 14,
            fontFace: 'Arial',
            color: 'FFD700', // Gold
            italic: true
          });
        }

        // Discussion Question (Sidebar style)
        if (s.discussionQuestion) {
          slide.addShape(pres.ShapeType.rect, {
             x: 9.5, y: 2.0, w: 3.5, h: 4.0,
             fill: { color: '1E3A8A', transparency: 20 }, // Blue-900 ish
             line: { color: '60A5FA', width: 1 } // Blue-400
          });
          
          slide.addText("KEY QUESTION", {
             x: 9.7, y: 2.2, w: 3.1, h: 0.3,
             fontSize: 10, color: 'BFDBFE', bold: true // Blue-200
          });

          slide.addText(s.discussionQuestion, {
            x: 9.7, y: 2.6, w: 3.1, h: 3.0,
            fontSize: 16,
            color: 'FFFFFF',
            bold: true,
            valign: 'top'
          });
        }

        // Speaker Notes
        slide.addNotes(s.speakerNotes);
      }

      // Add Sources Slide if sources exist (Required for Search Grounding)
      if (lessonPlan.sources && lessonPlan.sources.length > 0) {
        const slide = pres.addSlide();
        slide.background = { color: '111827' }; // Slate-900
        
        slide.addText("Sources", {
          x: 0.5, y: 0.5, w: '90%', h: 1.0,
          fontSize: 32,
          fontFace: 'Arial',
          color: 'FFFFFF',
          bold: true
        });

        const sourceItems = lessonPlan.sources.map(s => ({
          text: `${s.title}: ${s.uri}`,
          options: {
            fontSize: 14,
            color: '60A5FA',
            breakLine: true,
            hyperlink: { url: s.uri },
            paraSpaceBefore: 10
          }
        }));

        slide.addText(sourceItems, {
          x: 0.5, y: 1.5, w: '90%', h: 5.0,
          fontFace: 'Arial',
          valign: 'top'
        });
      }

      await pres.writeFile({ fileName: `Lesson - ${lessonPlan.topic}.pptx` });
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to generate PowerPoint. Please check your internet connection (needed for images).");
    } finally {
      setIsDownloading(false);
    }
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
            {lessonPlan.sources && lessonPlan.sources.length > 0 && (
              <button
                onClick={() => setShowSources(true)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm backdrop-blur-sm transition flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
                Sources
              </button>
            )}
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            >
              {isDownloading ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="hidden sm:inline">Download PPTX</span>
                </>
              )}
            </button>
             <button 
              onClick={onReset}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm backdrop-blur-sm transition"
            >
              Exit
            </button>
        </div>
      </div>

      {/* Sources Modal (Required by Gemini API Guidelines for Search Grounding) */}
      {showSources && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-8 animate-fadeIn">
          <div className="bg-slate-900 max-w-3xl w-full p-8 rounded-2xl border border-slate-700 shadow-2xl relative max-h-[80vh] overflow-y-auto">
            <button 
              onClick={() => setShowSources(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <span className="text-blue-400">🔗</span> Sources & Grounding
            </h2>
            <p className="text-slate-400 mb-6">
              This lesson plan was generated using information from the following sources:
            </p>
            <ul className="space-y-4">
              {lessonPlan.sources?.map((source, idx) => (
                <li key={idx} className="flex flex-col p-4 bg-slate-800 rounded-lg hover:bg-slate-750 transition">
                  <a 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline font-medium text-lg truncate"
                  >
                    {source.title}
                  </a>
                  <span className="text-slate-500 text-sm truncate mt-1">{source.uri}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Slide Content */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 bg-slate-900">
           {/* We use key={currentIndex} to force the image to unmount/remount for the fade effect */}
           {!imgError ? (
             <img 
               key={currentIndex}
               src={getImageUrl(currentSlide.imageKeyword)} 
               alt="Background" 
               onError={() => setImgError(true)}
               loading="eager"
               className="w-full h-full object-cover opacity-60 animate-fadeIn"
             />
           ) : (
             // Fallback gradient if image fails to load
             <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 opacity-60 animate-fadeIn" />
           )}
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