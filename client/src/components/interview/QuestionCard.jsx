// components/interview/QuestionCard.jsx
// Renders the current question text in a styled card.
// Receives the question string as a prop — no context coupling, fully reusable.

function QuestionCard({ question, questionNumber, totalQuestions }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
        <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" aria-hidden="true" />
        <span className="text-xs font-semibold text-indigo-600 tracking-wide uppercase">
          Q{questionNumber} of {totalQuestions}
        </span>
      </div>

      {/* Question text */}
      <p className="text-gray-800 text-base md:text-lg font-medium leading-relaxed">
        {question}
      </p>
    </div>
  );
}

export default QuestionCard;
