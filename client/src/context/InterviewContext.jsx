// context/InterviewContext.jsx
// SAD Section 3.1 / 12.2: interview session state for the active session.
// Stores: questions[], answers[], currentQuestionIndex, interviewConfig,
// timeRemaining, isInterviewStarted.
//
// Phase 2 scope only: no evaluation, no scores, no submission logic.
// Timer is purely UI — counts down, never auto-submits, never calls backend.

import { createContext, useCallback, useEffect, useRef, useState } from 'react';

const InterviewContext = createContext(null);

// Timer resolution in milliseconds.
const TICK_MS = 1000;

// Default seconds per question when mode is Timed (60 s × count).
function computeTotalSeconds(count) {
  return count * 60;
}

export function InterviewProvider({ children }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewConfig, setInterviewConfig] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  // Keep a stable ref so the interval callback always sees the latest value
  // without being recreated on every tick.
  const timerRef = useRef(null);

  // Start a fresh session with the received questions and configuration.
  const startSession = useCallback((receivedQuestions, config) => {
    setQuestions(receivedQuestions);
    setAnswers(new Array(receivedQuestions.length).fill(''));
    setCurrentQuestionIndex(0);
    setInterviewConfig(config);
    setTimeRemaining(computeTotalSeconds(receivedQuestions.length));
    setIsInterviewStarted(true);
  }, []);

  // Save the answer for the current question without affecting other answers.
  const saveAnswer = useCallback((index, text) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = text;
      return next;
    });
  }, []);

  // Navigation — clamp to valid range.
  const goToQuestion = useCallback((index) => {
    setCurrentQuestionIndex((prev) => {
      if (index < 0 || index >= questions.length) return prev;
      return index;
    });
  }, [questions.length]);

  const goNext = useCallback(() => {
    setCurrentQuestionIndex((prev) =>
      prev < questions.length - 1 ? prev + 1 : prev
    );
  }, [questions.length]);

  const goPrevious = useCallback(() => {
    setCurrentQuestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Reset everything — used when the user starts a new interview.
  const resetSession = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setInterviewConfig(null);
    setTimeRemaining(0);
    setIsInterviewStarted(false);
  }, []);

  // Countdown timer — starts when isInterviewStarted becomes true, stops
  // when the session is reset. Does NOT auto-submit or call any backend.
  useEffect(() => {
    if (!isInterviewStarted) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Timer exhausted: stop the interval but do nothing else.
          // Submission / timeout handling is reserved for a later phase.
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, TICK_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isInterviewStarted]);

  const value = {
    questions,
    answers,
    currentQuestionIndex,
    interviewConfig,
    timeRemaining,
    isInterviewStarted,
    startSession,
    saveAnswer,
    goToQuestion,
    goNext,
    goPrevious,
    resetSession,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
}

export default InterviewContext;
