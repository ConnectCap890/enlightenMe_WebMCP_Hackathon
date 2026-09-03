import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { saveQuiz, submitAnswer } from '../utils/api'

interface Question {
    question:    string
    options:     string[]
    correct:     number
    explanation: string
    topic:       string
}

interface LocationState {
    prompt:     string
    lecture_id: string
    difficulty: 'easy' | 'medium' | 'hard'
}

const QuizPage = () => {
    const location                        = useLocation()
    const navigate                        = useNavigate()
    const state                           = location.state as LocationState

    const [questions, setQuestions]       = useState<Question[]>([])
    const [answers, setAnswers]           = useState<number[]>([])
    const [currentQ, setCurrentQ]         = useState(0)
    const [quizId, setQuizId]             = useState<string | null>(null)
    const [result, setResult]             = useState<any>(null)
    const [loading, setLoading]           = useState(false)
    const [error, setError]               = useState<string | null>(null)
    const [step, setStep]                 = useState<'prompt' | 'quiz' | 'result'>('prompt')

    if (!state) {
        navigate('/')
        return null
    }

    const handleSaveQuiz = async (generatedQuestions: Question[]) => {
        try {
            const res = await saveQuiz({
                lecture_id: state.lecture_id,
                difficulty: state.difficulty,
                questions:  generatedQuestions,
            })
            setQuizId(res.data.id)
            setQuestions(generatedQuestions)
            setAnswers(new Array(generatedQuestions.length).fill(-1))
            setStep('quiz')
        } catch (err) {
            setError('Failed to save quiz')
        }
    }

    const handleAnswer = (optionIndex: number) => {
        const newAnswers = [...answers]
        newAnswers[currentQ] = optionIndex
        setAnswers(newAnswers)
    }

    const handleNext = () => {
        if (currentQ < questions.length - 1) {
            setCurrentQ(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        if (currentQ > 0) {
            setCurrentQ(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        if (!quizId) return
        setLoading(true)
        try {
            const res = await submitAnswer({
                quiz_id:    quizId,
                lecture_id: state.lecture_id,
                answers,
            })
            setResult(res.data)
            setStep('result')
        } catch (err) {
            setError('Failed to submit quiz')
        } finally {
            setLoading(false)
        }
    }

    const difficultyColors = {
        easy:   'text-green-400',
        medium: 'text-yellow-400',
        hard:   'text-red-400',
    }

    // ── Step 1: Show Prompt for ChatGPT ──────────────────────────────
    if (step === 'prompt') {
        return (
            <div className="max-w-3xl mx-auto px-6 py-10">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-2"
                >
                    ← Back
                </button>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
                    <h1 className="text-2xl font-bold text-white mb-2">
                        🧪 Generate Quiz
                    </h1>
                    <p className={`text-sm mb-6 ${difficultyColors[state.difficulty]}`}>
                        Difficulty: {state.difficulty}
                    </p>

                    <p className="text-gray-400 text-sm mb-4">
                        Copy this prompt and paste it into ChatGPT to generate your quiz questions,
                        then paste the JSON response below:
                    </p>

                    {/* Prompt Box */}
                    <div className="bg-gray-800 rounded-lg p-4 mb-6">
                        <pre className="text-gray-300 text-xs whitespace-pre-wrap overflow-auto max-h-48">
                            {state.prompt}
                        </pre>
                    </div>

                    {/* Paste JSON Response */}
                    <label className="block text-gray-400 text-sm mb-2">
                        Paste ChatGPT JSON response here:
                    </label>
                    <textarea
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-4 text-sm font-mono focus:outline-none focus:border-indigo-500 h-48"
                        placeholder='[{"question": "...", "options": [...], "correct": 0, "explanation": "...", "topic": "..."}]'
                        onChange={(e) => {
                            try {
                                const parsed = JSON.parse(e.target.value)
                                if (Array.isArray(parsed)) {
                                    setError(null)
                                    handleSaveQuiz(parsed)
                                }
                            } catch {
                                setError('Invalid JSON — make sure you copied the full response')
                            }
                        }}
                    />

                    {error && (
                        <p className="text-red-400 text-sm mt-3">{error}</p>
                    )}
                </div>
            </div>
        )
    }

    // ── Step 2: Quiz ─────────────────────────────────────────────────
    if (step === 'quiz') {
        const question = questions[currentQ]
        const selected = answers[currentQ]

        return (
            <div className="max-w-3xl mx-auto px-6 py-10">

                {/* Progress */}
                <div className="flex items-center justify-between mb-6">
                    <span className="text-gray-400 text-sm">
                        Question {currentQ + 1} of {questions.length}
                    </span>
                    <span className={`text-sm font-medium ${difficultyColors[state.difficulty]}`}>
                        {state.difficulty}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-800 rounded-full h-2 mb-8">
                    <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                    />
                </div>

                {/* Question */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-6">
                    <p className="text-white text-lg font-semibold mb-6">
                        {question.question}
                    </p>

                    <div className="space-y-3">
                        {question.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                                    selected === index
                                        ? 'border-indigo-500 bg-indigo-900/30 text-white'
                                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                                }`}
                            >
                                <span className="font-medium text-indigo-400 mr-2">
                                    {String.fromCharCode(65 + index)}.
                                </span>
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handlePrev}
                        disabled={currentQ === 0}
                        className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-30 transition"
                    >
                        ← Previous
                    </button>

                    {currentQ === questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={answers.includes(-1) || loading}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition"
                        >
                            {loading ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={selected === -1}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition"
                        >
                            Next →
                        </button>
                    )}
                </div>

                {error && (
                    <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
                )}
            </div>
        )
    }

    // ── Step 3: Result ───────────────────────────────────────────────
    return (
        <div className="max-w-3xl mx-auto px-6 py-10">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">

                <p className="text-6xl mb-4">
                    {result.percentage >= 80 ? '🏆' : result.percentage >= 60 ? '👍' : '📚'}
                </p>

                <h1 className="text-3xl font-bold text-white mb-2">
                    {result.score}/{result.total} Correct
                </h1>

                <p className={`text-4xl font-bold mb-6 ${
                    result.percentage >= 80
                        ? 'text-green-400'
                        : result.percentage >= 60
                        ? 'text-yellow-400'
                        : 'text-red-400'
                }`}>
                    {result.percentage}%
                </p>

                {result.weak_topics.length > 0 && (
                    <div className="bg-gray-800 rounded-xl p-5 mb-6 text-left">
                        <p className="text-white font-semibold mb-3">
                            📌 Topics to Review:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {result.weak_topics.map((topic: string, index: number) => (
                                <span
                                    key={index}
                                    className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-3 py-1 rounded-full"
                                >
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                    >
                        Back to Lecture
                    </button>
                </div>
            </div>
        </div>
    )
}

export default QuizPage