
export enum AppState {
  LOGIN,
  ONBOARDING,
  SUBSCRIPTION,
  SETUP,
  IN_CALL,
  GENERATING_FEEDBACK,
  FEEDBACK,
  PROFILE,
}

export interface Scenario {
  consultantRole: string;
  leadSource: string;
  clientRole: string;
  clientPersona: string;
  industry: string;
  objectionStyle: string;
}

export interface SavedScenario extends Scenario {
  id: string;
  name: string;
}

export interface FeedbackItem {
  point: string;
  details: string[];
}

export interface Feedback {
  score: number;
  strengths: string[];
  improvements: FeedbackItem[];
  coachingTips: FeedbackItem[];
  practiceQuestions: string[];
}

export interface TranscriptMessage {
  speaker: 'user' | 'ai';
  text: string;
  isPartial?: boolean;
}

export interface CallRecord {
  id: string;
  date: string;
  scenario: Scenario;
  transcript: TranscriptMessage[];
  feedback: Feedback;
  callRecordingUrl: string | null;
}

export interface UserProfile {
  id: string; // Firebase UID
  name: string;
  email: string | null;
  callHistory: CallRecord[];
  savedScenarios: SavedScenario[];
  subscriptionStatus?: 'pro' | 'trial' | 'founder' | 'cancelled' | 'suspended';
  trialEndDate?: Date;
  createdAt?: Date;
  paypalSubscriptionId?: string;
  subscriptionProvider?: 'paypal' | null;
}