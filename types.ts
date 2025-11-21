export enum Audience {
  PRIMARY = 'Primary (Children)',
  YOUTH = 'Youth (Teens)',
  GOSPEL_DOCTRINE = 'Gospel Doctrine (Adults)',
  GOSPEL_ESSENTIALS = 'Gospel Essentials (New Members)',
}

export interface Slide {
  title: string;
  bullets: string[];
  scriptureReference?: string;
  discussionQuestion?: string;
  imageKeyword: string;
  speakerNotes: string;
}

export interface LessonPlan {
  topic: string;
  date: string;
  audience: Audience;
  slides: Slide[];
  sources: Array<{ title: string; uri: string }>;
}

export type GenerationStatus = 'idle' | 'identifying-lesson' | 'generating-slides' | 'complete' | 'error';
