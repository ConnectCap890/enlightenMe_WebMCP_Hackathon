interface Lecture {
    id:            string
    title:         string
    source:        'youtube' | 'chatgpt'
    youtube_url:   string
    plain_english: string
    created_at:    string
}

interface Props {
    lecture:  Lecture
    onClick:  () => void
    onDelete: (id: string) => void
}

const LectureCard = ({ lecture, onClick, onDelete }: Props) => {
    return (
        <div
            onClick={onClick}
            className="bg-gray-900 border border-gray-800 hover:border-indigo-500 rounded-xl p-5 cursor-pointer transition group"
        >
            <div className="flex items-start justify-between">

                {/* Left Side */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                            {lecture.source === 'youtube' ? '🎥' : '🤖'}
                        </span>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                            {lecture.source === 'youtube' ? 'YouTube' : 'ChatGPT'}
                        </span>
                    </div>
                    <h3 className="text-white font-semibold text-lg group-hover:text-indigo-400 transition">
                        {lecture.title}
                    </h3>
                    {lecture.plain_english && (
                        <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                            {lecture.plain_english}
                        </p>
                    )}
                    <p className="text-gray-600 text-xs mt-3">
                        {new Date(lecture.created_at).toLocaleDateString()}
                    </p>
                </div>

                {/* Delete Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onDelete(lecture.id)
                    }}
                    className="text-gray-600 hover:text-red-400 transition ml-4 text-xl"
                >
                    ×
                </button>
            </div>
        </div>
    )
}

export default LectureCard