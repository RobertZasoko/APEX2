import React from 'react';
import { Feedback, FeedbackItem } from '../types';
import CallRecordingPlayer from './CallRecordingPlayer';

interface FeedbackDetailsProps {
  feedback: Feedback;
  callRecordingUrl: string | null;
}

const isFeedbackItem = (item: string | FeedbackItem): item is FeedbackItem => {
  return typeof item === 'object' && item !== null && 'point' in item;
};

const FeedbackCard: React.FC<{ title: string; items: (string | FeedbackItem)[]; type: 'positive' | 'constructive' }> = ({ title, items, type }) => {
  const borderColor = type === 'positive' ? 'border-feedback-positive' : 'border-feedback-constructive';
  const textColor = type === 'positive' ? 'text-feedback-positive' : 'text-feedback-constructive';

  return (
    <div className={`bg-panel p-4 rounded-lg border border-border border-l-4 ${borderColor}`}>
      <h3 className={`text-lg font-semibold mb-2 font-heading ${textColor}`}>{title}</h3>
      {items.length > 0 ? (
        <ul className="list-disc list-inside space-y-2 text-text-primary">
          {items.map((item, index) => {
            if (isFeedbackItem(item)) {
              return (
                <li key={index}>
                  {item.point}
                  {item.details && item.details.length > 0 && (
                    <ul className="list-[circle] list-inside pl-4 mt-1 space-y-1 text-text-secondary">
                      {item.details.map((detail, detailIndex) => (
                        <li key={`${index}-${detailIndex}`}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }
            return <li key={index}>{item}</li>;
          })}
        </ul>
      ) : (
        <p className="text-text-secondary">No specific items noted in this category.</p>
      )}
    </div>
  );
};


const FeedbackDetails: React.FC<FeedbackDetailsProps> = ({ feedback, callRecordingUrl }) => {
  return (
    <>
      {callRecordingUrl && <CallRecordingPlayer audioUrl={callRecordingUrl} />}

      <div className="text-center my-6">
        <p className="text-lg text-text-secondary">Overall Score</p>
        <p className="text-7xl font-bold text-primary">{feedback.score}<span className="text-3xl text-text-secondary">/10</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeedbackCard title="Strengths" items={feedback.strengths} type="positive" />
        <FeedbackCard title="Areas for Improvement" items={feedback.improvements} type="constructive" />
        <FeedbackCard title="Coaching Tips" items={feedback.coachingTips} type="constructive" />
        <FeedbackCard title="Practice Questions" items={feedback.practiceQuestions} type="constructive" />
      </div>
    </>
  );
};

export default FeedbackDetails;
