"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Award,
  ArrowRight,
  Check,
} from "lucide-react";
import Swal from "sweetalert2";

import { API_BASE_URL } from "@/lib/api";

interface Question {
  id?: string;
  _id?: string;
  questionText: string;
  type?: string;
  options: string[];
  correctAnswer?: string;
  correctOptionIndex?: number;
  explanation?: string;
}

interface QuizData {
  _id?: string;
  id?: string;
  title?: string;
  timeLimitMins?: number;
  passMarkPercent?: number;
  questions: Question[];
}

interface InteractiveQuizPlayerProps {
  quiz: QuizData;
  lessonTitle?: string;
  courseId?: string;
  onQuizCompleted?: (passed: boolean, scorePercent: number) => void;
}

export function InteractiveQuizPlayer({
  quiz,
  lessonTitle = "Section Assessment Quiz",
  courseId = "",
  onQuizCompleted,
}: InteractiveQuizPlayerProps) {
  const timeLimitSeconds = (quiz?.timeLimitMins || 15) * 60;
  const passMark = quiz?.passMarkPercent || 75;
  const questions = quiz?.questions || [];

  const [quizState, setQuizState] = useState<"not_started" | "in_progress" | "submitted">("not_started");
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimitSeconds);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isTimeOut, setIsTimeOut] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<{
    correctCount: number;
    total: number;
    percent: number;
    passed: boolean;
  } | null>(null);

  // Check if student already submitted this quiz
  useEffect(() => {
    const checkPriorSubmission = async () => {
      // 1. Check local storage
      try {
        const stored = JSON.parse(localStorage.getItem(`educore_quiz_submissions_${courseId}`) || "[]");
        const found = stored.find(
          (s: any) =>
            (quiz._id && s.quizId === quiz._id) ||
            (quiz.id && s.quizId === quiz.id) ||
            s.quizTitle === (quiz.title || lessonTitle)
        );
        if (found) {
          setFinalScore({
            correctCount: found.score,
            total: found.totalQuestions || questions.length,
            percent: found.percentage,
            passed: found.passed,
          });
          setQuizState("submitted");
          return;
        }
      } catch (e) {}

      // 2. Check backend submissions
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
          const res = await fetch(`${API_BASE_URL}/quizzes/my-submissions`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.submissions)) {
            const foundBackend = data.submissions.find(
              (sub: any) =>
                (sub.quiz && (sub.quiz._id === quiz._id || sub.quiz === quiz._id)) ||
                (sub.course && (sub.course._id === courseId || sub.course === courseId))
            );
            if (foundBackend) {
              setFinalScore({
                correctCount: foundBackend.score,
                total: foundBackend.totalQuestions || questions.length,
                percent: foundBackend.percentage,
                passed: foundBackend.passed,
              });
              setQuizState("submitted");
            }
          }
        }
      } catch (e) {}
    };

    checkPriorSubmission();
  }, [quiz, courseId, lessonTitle, questions.length]);

  // Countdown Timer
  useEffect(() => {
    if (quizState !== "in_progress") return;

    if (timeLeft <= 0) {
      handleTimeExpired();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState, timeLeft]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartQuiz = () => {
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setTimeLeft(timeLimitSeconds);
    setIsTimeOut(false);
    setFinalScore(null);
    setQuizState("in_progress");
  };

  const handleSelectOption = (qIndex: number, optionIndex: number) => {
    if (quizState !== "in_progress") return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex,
    }));
  };

  const calculateResults = () => {
    let correct = 0;
    const total = questions.length;

    questions.forEach((q, idx) => {
      const selectedOptIdx = selectedAnswers[idx];
      if (selectedOptIdx === undefined) return;

      // Determine correct option index
      let correctIdx = q.correctOptionIndex;
      if (correctIdx === undefined || correctIdx === null) {
        if (q.correctAnswer) {
          const foundIdx = q.options?.findIndex(
            (opt) => opt.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()
          );
          correctIdx = foundIdx !== -1 ? foundIdx : 0;
        } else {
          correctIdx = 0;
        }
      }

      if (selectedOptIdx === correctIdx) {
        correct++;
      }
    });

    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = percent >= passMark && !isTimeOut;

    return { correctCount: correct, total, percent, passed };
  };

  const handleTimeExpired = () => {
    setIsTimeOut(true);
    const result = calculateResults();
    const finalResult = { ...result, passed: false };
    setFinalScore(finalResult);
    setQuizState("submitted");

    Swal.fire({
      icon: "error",
      title: "⏰ Time's Up!",
      text: `Your time has expired. You failed the quiz because it was not submitted within the ${quiz.timeLimitMins || 15} minutes time limit.`,
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#ef4444",
    });

    if (onQuizCompleted) {
      onQuizCompleted(false, result.percent);
    }
  };

  const handleSubmitQuiz = () => {
    const unansweredCount = questions.length - Object.keys(selectedAnswers).length;
    
    if (unansweredCount > 0) {
      Swal.fire({
        title: "Unanswered Questions",
        text: `Please answer all questions first! You still have ${unansweredCount} unanswered question(s).`,
        icon: "warning",
        confirmButtonColor: "#7c3aed",
        background: "#0f172a",
        color: "#ffffff",
      });
      return;
    }
    
    finalizeSubmission();
  };

  const finalizeSubmission = async () => {
    const result = calculateResults();
    setFinalScore(result);
    setQuizState("submitted");

    // Save quiz result locally
    try {
      const stored = JSON.parse(localStorage.getItem(`educore_quiz_submissions_${courseId}`) || "[]");
      const updated = [
        ...stored.filter((s: any) => s.quizTitle !== (quiz.title || lessonTitle)),
        {
          quizId: quiz._id || quiz.id,
          quizTitle: quiz.title || lessonTitle,
          courseId,
          score: result.correctCount,
          totalQuestions: result.total,
          percentage: result.percent,
          passed: result.passed,
          submittedAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(`educore_quiz_submissions_${courseId}`, JSON.stringify(updated));
    } catch (e) {}

    // Submit to backend API if logged in
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token && courseId) {
        const answersArray = Object.entries(selectedAnswers).map(([qIdx, selectedOpt]) => ({
          questionId: questions[Number(qIdx)]?._id || `q-${qIdx}`,
          selectedOption: selectedOpt,
        }));
        await fetch(`${API_BASE_URL}/quizzes/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quizId: quiz._id || quiz.id || "quiz-sub",
            courseId,
            answers: answersArray,
          }),
        });
      }
    } catch (err) {}

    if (result.passed) {
      Swal.fire({
        icon: "success",
        title: "🎉 Congratulations! You Passed!",
        html: `<p>You scored <strong>${result.percent}%</strong> (Pass Mark: ${passMark}%).<br/><span style="color: #10b981;">+100 XP Earned!</span></p>`,
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#10b981",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "❌ Quiz Failed",
        html: `<p>You scored <strong>${result.percent}%</strong>, which is below the pass mark of <strong>${passMark}%</strong>.<br/>Please review your mistakes and retake the quiz to pass.</p>`,
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#7c3aed",
        confirmButtonText: "Review Answers",
      });
    }

    if (onQuizCompleted) {
      onQuizCompleted(result.passed, result.percent);
    }
  };

  const optionLabels = ["a", "b", "c", "d"];

  // 1. NOT STARTED STATE (Intro Card)
  if (quizState === "not_started") {
    return (
      <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/10">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Step-By-Step MCQ Assessment
          </span>
          <h2 className="text-2xl font-black text-white">{quiz.title || lessonTitle}</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Answer each question one by one using Next / Previous. All questions must be answered to submit for final grading.
          </p>
        </div>

        {/* Quiz Parameters Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Total Questions</span>
            <span className="text-lg font-black text-white">{questions.length} MCQs</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Time Limit</span>
            <span className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{quiz.timeLimitMins || 15} Mins</span>
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Pass Mark</span>
            <span className="text-lg font-black text-emerald-400">{passMark}%</span>
          </div>
        </div>

        {/* Rules Alert */}
        <div className="max-w-md mx-auto text-left p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
          <p className="font-bold text-slate-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Quiz Rules & Requirements:</span>
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li>Timer starts as soon as you click <strong>Start Quiz</strong>.</li>
            <li>Questions are presented <strong>one at a time</strong>.</li>
            <li>You must answer <strong>all questions</strong> to enable submission.</li>
            <li>You must achieve at least <strong>{passMark}%</strong> to pass.</li>
          </ul>
        </div>

        <div>
          <button
            type="button"
            onClick={handleStartQuiz}
            disabled={questions.length === 0}
            className="px-8 py-3.5 rounded-2xl text-xs font-bold text-white gradient-button shadow-xl shadow-purple-600/30 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>{questions.length === 0 ? "No Questions Configured" : "Start Quiz Now"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 2. IN PROGRESS STATE (One Question at a Time + Next/Prev + Question Navigator)
  if (quizState === "in_progress") {
    const isTimeCritical = timeLeft <= 60; // under 1 min
    const answeredCount = Object.keys(selectedAnswers).length;
    const allAnswered = questions.length > 0 && answeredCount === questions.length;
    const currentQ = questions[currentQIndex] || questions[0];
    const isCurrentAnswered = selectedAnswers[currentQIndex] !== undefined;

    return (
      <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Sticky Quiz Header with Live Timer & Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Live MCQ Examination</span>
            <h3 className="text-lg font-black text-white">{quiz.title || lessonTitle}</h3>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-2xl border flex items-center gap-2 transition-all ${
                isTimeCritical
                  ? "bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse"
                  : "bg-slate-900 border-amber-500/40 text-amber-300"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Time Left:</span>
              <span className="text-sm font-black font-mono">{formatTime(timeLeft)}</span>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
              Answered: <span className="text-purple-400">{answeredCount}</span>/{questions.length}
            </div>
          </div>
        </div>

        {/* Question Jump Pills / Navigator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Question Navigation</span>
            <span>
              Progress: <strong className="text-purple-400">{Math.round((answeredCount / (questions.length || 1)) * 100)}%</strong>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {questions.map((_, qIdx) => {
              const isSelected = currentQIndex === qIdx;
              const isDone = selectedAnswers[qIdx] !== undefined;

              return (
                <button
                  key={qIdx}
                  type="button"
                  onClick={() => setCurrentQIndex(qIdx)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center border ${
                    isSelected
                      ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/40 scale-110 ring-2 ring-purple-400/40"
                      : isDone
                      ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  {isDone && !isSelected ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  ) : (
                    qIdx + 1
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Single Active Question Card */}
        {currentQ && (
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5 animate-fadeIn">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800/80">
              <span className="px-3 py-1 rounded-xl text-xs font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <span>Question {currentQIndex + 1} of {questions.length}</span>
              </span>

              {isCurrentAnswered ? (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Answer Selected
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                  Select an Option
                </span>
              )}
            </div>

            <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQ.questionText}
            </p>

            {/* 4 MCQ Options: a, b, c, d */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQ.options?.map((optText, optIdx) => {
                const isSelected = selectedAnswers[currentQIndex] === optIdx;
                const letter = optionLabels[optIdx] || `${optIdx + 1}`;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(currentQIndex, optIdx)}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-purple-950/60 border-purple-500 text-white shadow-xl shadow-purple-900/40 ring-1 ring-purple-500"
                        : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-purple-500/40 hover:bg-slate-900"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? "bg-purple-600 border-purple-400 text-white shadow-md"
                          : "bg-slate-900 border-slate-800 text-slate-400"
                      }`}
                    >
                      {letter.toUpperCase()}
                    </span>
                    <span className="text-xs sm:text-sm font-medium flex-1 leading-snug">
                      {optText || `Option ${letter.toUpperCase()}`}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step-by-Step Bottom Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Previous Button */}
            <button
              type="button"
              onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              <span>Previous</span>
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={() => setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentQIndex === questions.length - 1}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-900/60 hover:bg-purple-900/90 border border-purple-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Submit Quiz Button: Enabled ONLY when all questions answered */}
          <div className="w-full sm:w-auto flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={handleSubmitQuiz}
              disabled={!allAnswered}
              className={`w-full sm:w-auto px-8 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                allAnswered
                  ? "text-white gradient-button shadow-xl shadow-purple-600/30 hover:scale-105 cursor-pointer ring-2 ring-emerald-500/30"
                  : "bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {allAnswered
                  ? "Submit Quiz for Grading"
                  : `Submit Quiz (${questions.length - answeredCount} Remaining)`}
              </span>
            </button>
            {!allAnswered && (
              <span className="text-[10px] text-amber-400/90 font-medium">
                ⚠️ Answer all {questions.length} questions to enable submission
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. SUBMITTED STATE (Result Score Card - No Answer Leaks)
  if (quizState === "submitted" && finalScore) {
    const { correctCount, total, percent, passed } = finalScore;
    const incorrectCount = total - correctCount;

    return (
      <div className="w-full max-w-2xl mx-auto bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
        {/* Score Card Banner */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border text-center space-y-5 relative overflow-hidden ${
            passed
              ? "bg-gradient-to-b from-emerald-950/40 to-slate-950 border-emerald-500/40 shadow-emerald-950/30"
              : "bg-gradient-to-b from-rose-950/40 to-slate-950 border-rose-500/40 shadow-rose-950/30"
          }`}
        >
          <div
            className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-2xl ${
              passed
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
            }`}
          >
            {passed ? <Award className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>

          <div className="space-y-1.5">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                passed
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/30"
              }`}
            >
              {isTimeOut ? "Time Out — Failed" : passed ? "Assessment Passed" : "Assessment Failed"}
            </span>
            <h2 className="text-4xl font-black text-white">{percent}% Score</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {passed
                ? `Great job! You achieved ${percent}% and met the passing criteria of ${passMark}%.`
                : isTimeOut
                ? `Time expired before submission. You scored ${percent}% (Pass Mark: ${passMark}%).`
                : `You scored ${percent}%, but a minimum of ${passMark}% is required to pass this assessment.`}
            </p>
          </div>

          {/* Assessment Summary Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Total Questions</span>
              <span className="text-base font-black text-white">{total}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="block text-[10px] uppercase font-bold text-emerald-400 mb-0.5">Correct</span>
              <span className="text-base font-black text-emerald-400">{correctCount}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="block text-[10px] uppercase font-bold text-rose-400 mb-0.5">Incorrect</span>
              <span className="text-base font-black text-rose-400">{incorrectCount}</span>
            </div>
          </div>

          <div className="pt-3 flex flex-col items-center gap-2">
            <div className="px-5 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-bold flex items-center gap-2 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Assessment Completed • Single Attempt Policy Active</span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-sm">
              Your assessment submission has been recorded. Retakes are strictly disabled to preserve academic integrity.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
