import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllLectures, deleteLecture } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import LectureCard from '../components/LectureCard'
import WeakTopics from '../components/WeakTopics'

interface Lecture {
    id:            string
    title:         string
    source:        'youtube' | 'chatgpt'
    youtube_url:   string
    plain_english: string
    created_at:    string
}

const Dashboard = () => {
    const navigate                    = useNavigate()
    const { user, stats }             = useAuth()
    const [lectures, setLectures]     = useState<Lecture[]>([])
    const [loading, setLoading]       = useState(true)
    const [error, setError]           = useState<string | null>(null)

    const fetchLectures = async () => {
        try {
            const res = await getAllLectures()
            setLectures(res.data.lectures)
        } catch (err) {
            setError('Failed to load lectures')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteLecture(id)
            setLectures(prev => prev.filter(l => l.id !== id))
        } catch (err) {
            setError('Failed to delete lecture')
        }
    }

    useEffect(() => {
        fetchLectures()
    }, [])

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">

            {/* Welcome Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-white">
                    Welcome back, {user?.username}! 👋
                </h1>
                <p className="text-gray-400 mt-2">
                    Your personal AI-powered learning hub
                </p>
            </div>

            {/* Stats Row */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                        <p className="text-3xl font-bold text-indigo-400">
                            {stats.total_topics}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">Topics Learned</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                        <p className="text-3xl font-bold text-green-400">
                            {stats.quizzes_taken}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">Quizzes Taken</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                        <p className="text-3xl font-bold text-yellow-400">
                            {stats.average_score}%
                        </p>
                        <p className="text-gray-400 text-sm mt-1">Average Score</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
                        <p className="text-3xl font-bold text-pink-400">
                            {stats.best_score}%
                        </p>
                        <p className="text-gray-400 text-sm mt-1">Best Score</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Lectures Section */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">
                            📚 My Topics
                        </h2>
                    </div>

                    {loading && (
                        <div className="text-center text-gray-400 py-20">
                            Loading your topics...
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900/30 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {!loading && lectures.length === 0 && (
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
                            <p className="text-5xl mb-4">🤖</p>
                            <p className="text-gray-400 text-lg">
                                No topics yet!
                            </p>
                            <p className="text-gray-500 text-sm mt-2">
                                Ask ChatGPT to explain a topic and it will appear here.
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {lectures.map(lecture => (
                            <LectureCard
                                key={lecture.id}
                                lecture={lecture}
                                onDelete={handleDelete}
                                onClick={() => navigate(`/lecture/${lecture.id}`)}
                            />
                        ))}
                    </div>
                </div>

                {/* Weak Topics Sidebar */}
                <div className="lg:col-span-1">
                    <WeakTopics />
                </div>
            </div>
        </div>
    )
}

export default Dashboard