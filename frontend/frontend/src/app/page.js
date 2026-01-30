"use client";
import { useState, useEffect } from "react";

const QUESTIONS = [
  { id: 1, question: "What is the complexity of binary search?", options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"], answer: "O(log n)" },
  { id: 2, question: "Which HTTP method is idempotent?", options: ["POST", "PUT", "CONNECT", "None"], answer: "PUT" },
  { id: 3, question: "What is the output of 2 + '2' in JS?", options: ["4", "22", "NaN", "Error"], answer: "22" },
  { id: 4, question: "React uses a ____ DOM.", options: ["Real", "Shadow", "Virtual", "Incremental"], answer: "Virtual" },
  { id: 5, question: "Node.js is ___ threaded.", options: ["Multi", "Single", "Double", "Hyper"], answer: "Single" },
];

export default function Quiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isClient, setIsClient] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("quiz_progress");
    if (saved) {
      
      setUserAnswers(JSON.parse(saved));
    }
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) localStorage.setItem("quiz_progress", JSON.stringify(userAnswers));
  }, [userAnswers, isClient]);

  const handleSelect = (option) => {
    if (userAnswers[currentStep]) return;
    setUserAnswers((prev) => ({ ...prev, [currentStep]: option }));
  };

  const resetQuiz = () => {
    localStorage.removeItem("quiz_progress");
    window.location.reload();
  };

  if (!isClient) return null;

  if (showSummary) {
    const score = QUESTIONS.reduce((acc, q, i) => acc + (userAnswers[i] === q.answer ? 1 : 0), 0);
    return (
      <div className="container center-screen">
        <div className="card text-center">
          <h1 className="title">Quiz Completed!</h1>
          <p className="score">Score: {score} / {QUESTIONS.length}</p>
          <button onClick={resetQuiz} className="btn primary">Restart Quiz</button>
        </div>
      </div>
    );
  }

  const currentQ = QUESTIONS[currentStep];
  const storedAnswer = userAnswers[currentStep];
  
  return (
    <div className="container">
      <div className="card">
        
        <div className="progress-bg">
          <div className="progress-fill" style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}></div>
        </div>
        
        <p className="step-count">Question {currentStep + 1} of {QUESTIONS.length}</p>
        <h2 className="question-text">{currentQ.question}</h2>

        <div className="options-list">
          {currentQ.options.map((opt) => {
            let className = "option-btn";
            const isSelected = storedAnswer === opt;
            const isCorrect = opt === currentQ.answer;

            if (storedAnswer) {
              if (isSelected && isCorrect) className += " correct";
              else if (isSelected && !isCorrect) className += " incorrect";
              else if (!isSelected && isCorrect) className += " correct-dimmed"; 
              else className += " disabled";
            }

            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                disabled={!!storedAnswer}
                className={className}
              >
                {opt} {storedAnswer && isSelected && (isCorrect ? "✅" : "❌")}
              </button>
            );
          })}
        </div>

        <div className="nav-buttons">
          <button onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 0} className="btn">Previous</button>
          
          {currentStep === QUESTIONS.length - 1 ? (
             <button onClick={() => setShowSummary(true)} className="btn success">Submit</button>
          ) : (
             <button onClick={() => setCurrentStep(prev => prev + 1)} className="btn primary">Next</button>
          )}
        </div>
      </div>
    </div>
  );
}