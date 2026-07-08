// components/interview/AnswerInput.jsx
// Controlled textarea for the user's answer to the current question.
// onChange is forwarded to the parent (InterviewSessionPage), which calls
// saveAnswer() — ensuring every keystroke is persisted in context so
// navigating away and back never loses the typed text.

function AnswerInput({ value, onChange, questionIndex }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={`answer-${questionIndex}`}
        className="text-sm font-medium text-gray-700"
      >
        Your Answer
      </label>
      <textarea
        id={`answer-${questionIndex}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder="Type your answer here…"
        className="
          w-full resize-none rounded-xl border border-gray-200 bg-gray-50
          px-4 py-3 text-sm text-gray-800 leading-relaxed
          focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
          placeholder:text-gray-400 transition-shadow duration-200
          hover:border-gray-300
        "
        aria-label={`Answer for question ${questionIndex + 1}`}
      />
      <p className="text-xs text-gray-400 text-right">
        {value.length} character{value.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

export default AnswerInput;
