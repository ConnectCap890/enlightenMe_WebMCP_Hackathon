import { useState, useEffect } from 'react'
import { getWeakTopics } from '../utils/api'

interface WeakTopic {
    topic:       string
    wrong_count: number
    priority:    'high' | 'medium' | 'low'
}

const priorityConfig = {
    high:   { color: 'text-red-400',    bg: 'bg-red-900/20',    border: 'border-red-800',    emoji: '🔴' },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-800', emoji: '🟡' },
    low:    { color: 'text-green-400',  bg: 'bg-green-900/20',  border: 'border-green-800',  emoji: '🟢' },
}

const WeakTopics = () => {
    const [topics,  setTopics]  = useState<WeakTopic[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getWeakTopics()
                setTopics(res.data.weak_topics)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">
                🎯 Study Next
            </h2>

            {loading && (
                <p className="text-gray-400 text-sm text-center py-4">
                    Loading...
                </p>
            )}

            {!loading && topics.length === 0 && (
                <div className="text-center py-6">
                    <p className="text-4xl mb-3">🏆</p>
                    <p className="text-gray-400 text-sm">
                        No weak topics yet!
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                        Take a quiz to see what to study next.
                    </p>
                </div>
            )}

            <div className="space-y-3">
                {topics.map((topic, index) => {
                    const config = priorityConfig[topic.priority]
                    return (
                        <div
                            key={index}
                            className={`${config.bg} border ${config.border} rounded-lg p-3`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span>{config.emoji}</span>
                                    <span className="text-white text-sm font-medium">
                                        {topic.topic}
                                    </span>
                                </div>
                                <span className={`${config.color} text-xs`}>
                                    ×{topic.wrong_count} wrong
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {topics.length > 0 && (
                <p className="text-gray-500 text-xs mt-4 text-center">
                    Ask ChatGPT to explain any of these topics!
                </p>
            )}
        </div>
    )
}

export default WeakTopics