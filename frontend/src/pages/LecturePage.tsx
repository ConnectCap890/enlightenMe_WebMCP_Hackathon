import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLecture, getQuizPrompt } from '../utils/api'
import QuizCard from '../components/QuizCard'

interface KeyConcept {
    title:       string
    explanation: string
}

interface Lecture {
    id:             string
    title:          string
    source:         'youtube' | 'chatgpt'
    youtube_url:    string
    plain_english:  string
    technical:      string
    advanced:       string
    key_concepts:   KeyConcept[]
    related_topics: string[]
    created_at:     string
}

type Tab = 'simple' | 'technical' | 'advanced' | 'concepts'

const LecturePage = () => {
    const { id }                      = useParams<{ id: string }>()
    const navigate                    = useNavigate()
    const [lecture, setLecture]       = useState<Lecture | null>(null)
    const [loading, setLoading]       = useState(true)
    const [activeTab, setActiveTab]   = useState<Tab>('simple')
    const [generating, setGenerating] = useState(false)
    const [error, setError]           = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getLecture(id!)
                setLecture(res.data)
            } catch (err) {
                setError('Lecture not found')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    const handleQuiz = async (difficulty: 'easy' | 'medium' | 'hard') => {
        if (!lecture) return
        setGenerating(true)
        setError(null)
        try {
            const res = await getQuizPrompt({
                lecture_id: lecture.id,
                difficulty,
            })
            navigate(`/quiz/${lecture.id}`, {
                state: {
                    prompt:     res.data.prompt,
                    lecture_id: lecture.id,
                    difficulty,
                }
            })
        } catch (err) {
            setError('Failed to generate quiz')
        } finally {
            setGenerating(false)
        }
    }

    const tabs: { key: Tab; label: string }[] = [
        { key: 'simple',    label: '📝 Simple'    },
        { key: 'technical', label: '🔬 Technical' },
        { key: 'advanced',  label: '🚀 Advanced'  },
        { key: 'concepts',  label: '💡 Concepts'  },
    ]

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen text-gray-400">
            Loading...
        </div>
    )

    if (error || !lecture) return (
        <div className="flex items-center justify-center min-h-screen text-red-400">
            {error || 'Lecture not found'}
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">

            {/* Back Button */}
            <button
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-2 transition"
            >
                ← Back to Dashboard
            </button>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">
                        {lecture.source === 'youtube' ? '🎥' : '🤖'}
                    </span>
                    <span className="text-gray-500 text-sm uppercase tracking-wide">
                        {lecture.source === 'youtube' ? 'YouTube Lecture' : 'AI Explanation'}
                    </span>
                </div>
                <h1 className="text-4xl font-bold text-white">
                    {lecture.title}
                </h1>
                        {lecture.youtube_url && (
                    
                        <><p className="text-indigo-400 text-sm mt-2">
                        {lecture.youtube_url}
                    </p><a
                        href={lecture.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block"
                    >
                            Watch on YouTube →
                        </a></>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            activeTab === tab.key
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 min-h-48">
                {activeTab === 'simple' && (
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {lecture.plain_english || 'No simple explanation yet. Ask ChatGPT to explain this topic!'}
                    </p>
                )}
                {activeTab === 'technical' && (
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {lecture.technical || 'No technical explanation yet.'}
                    </p>
                )}
                {activeTab === 'advanced' && (
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {lecture.advanced || 'No advanced explanation yet.'}
                    </p>
                )}
                {activeTab === 'concepts' && (
                    <div className="space-y-4">
                        {lecture.key_concepts.length === 0 ? (
                            <p className="text-gray-400">No key concepts yet.</p>
                        ) : (
                            lecture.key_concepts.map((kc, index) => (
                                <div
                                    key={index}
                                    className="border-l-2 border-indigo-500 pl-4"
                                >
                                    <p className="text-white font-semibold">
                                        {kc.title}
                                    </p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {kc.explanation}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Related Topics */}
            {lecture.related_topics.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-white font-semibold mb-3">
                        🔗 Related Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {lecture.related_topics.map((topic, index) => (
                            <span
                                key={index}
                                className="bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded-full"
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Quiz Section */}
            <div>
                <h3 className="text-white font-semibold mb-4">
                    🧪 Test Your Knowledge
                </h3>
                {generating ? (
                    <div className="text-center text-gray-400 py-8">
                        Generating quiz prompt...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(['easy', 'medium', 'hard'] as const).map(d => (
                            <QuizCard
                                key={d}
                                difficulty={d}
                                onClick={handleQuiz}
                            />
                        ))}
                    </div>
                )}
                {error && (
                    <p className="text-red-400 text-sm mt-3">{error}</p>
                )}
            </div>
        </div>
    )
}

export default LecturePage