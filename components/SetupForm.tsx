import React, { useState } from 'react';
import { Audience } from '../types';
import { AUDIENCE_OPTIONS, getUpcomingSundays, formatDate } from '../constants';

interface SetupFormProps {
  onGenerate: (date: Date, audience: Audience) => void;
  isGenerating: boolean;
}

export const SetupForm: React.FC<SetupFormProps> = ({ onGenerate, isGenerating }) => {
  const sundays = getUpcomingSundays(4);
  const [selectedDate, setSelectedDate] = useState<Date>(sundays[0]);
  const [selectedAudience, setSelectedAudience] = useState<Audience>(Audience.GOSPEL_DOCTRINE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(selectedDate, selectedAudience);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-slate-100">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Lesson Planner</h2>
        <p className="text-slate-500">Select a date and class to generate your Come, Follow Me slides.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Select Sunday</label>
          <div className="relative">
            <select
              value={selectedDate.toISOString()}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setSelectedDate(date);
              }}
              className="w-full p-4 pr-10 rounded-xl border-2 border-slate-200 bg-white text-lg font-bold text-slate-800 appearance-none focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer hover:border-blue-300"
            >
              {sundays.map((date) => (
                <option key={date.toISOString()} value={date.toISOString()}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4 4 4-4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Audience Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Select Class</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AUDIENCE_OPTIONS.map((option) => {
              const isSelected = selectedAudience === option.value;
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setSelectedAudience(option.value)}
                  className={`relative p-5 rounded-xl border-2 text-left transition-all duration-200 flex items-start space-x-4 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-md transform scale-[1.02]'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-3xl">{option.icon}</span>
                  <div>
                    <h3 className={`font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                      {option.label}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 leading-snug">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isGenerating}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
              isGenerating
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating Lesson...</span>
              </>
            ) : (
              <>
                <span>Generate Presentation</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};