interface Props {
    difficulty: 'easy' | 'medium' | 'hard'
    onClick:    (difficulty: 'easy' | 'medium' | 'hard') => void
}

const difficultyConfig = {
    easy:   { emoji: '🟢', color: 'text-green-400',  border: 'border-green-800',  bg: 'hover:bg-green-900/20', label: 'Easy',   desc: 'Basic definitions and concepts'         },
    medium: { emoji: '🟡', color: 'text-yellow-400', border: 'border-yellow-800', bg: 'hover:bg-yellow-900/20', label: 'Medium', desc: 'Application and understanding'           },
    hard:   { emoji: '🔴', color: 'text-red-400',    border: 'border-red-800',    bg: 'hover:bg-red-900/20',    label: 'Hard',   desc: 'Deep knowledge and edge cases'          },
}

const QuizCard = ({ difficulty, onClick }: Props) => {
    const config = difficultyConfig[difficulty]

    return (
        <button
            onClick={() => onClick(difficulty)}
            className={`w-full bg-gray-900 border ${config.border} ${config.bg} rounded-xl p-5 text-left transition cursor-pointer`}
        >
            <div className="flex items-center gap-3">
                <span className="text-2xl">{config.emoji}</span>
                <div>
                    <p className={`${config.color} font-semibold`}>
                        {config.label}
                    </p>
                    <p className="text-gray-400 text-sm">
                        {config.desc}
                    </p>
                </div>
                <span className="ml-auto text-gray-600">→</span>
            </div>
        </button>
    )
}

export default QuizCard