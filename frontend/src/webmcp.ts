import {
    searchLectures,
    createLecture,
    saveExplanation,
    getQuizPrompt,
    saveQuiz,
    submitAnswer,
    getWeakTopics,
    getAllLectures,
} from './utils/api'

const registerTools = () => {

    // ── Tool 1: Search Lectures ───────────────────────────────────────
    document.modelContext.registerTool({
        name: 'search_lectures',
        description: `Search YouTube for the top 3 most relevant lecture videos on a given topic. 
                      Use this when the user wants to learn something from a YouTube lecture. 
                      Returns a list of videos with title, channel, description and URL.`,
        inputSchema: {
            type: 'object',
            properties: {
                topic: {
                    type:        'string',
                    description: 'The topic to search for e.g. Binary Search Trees',
                }
            },
            required: ['topic'],
        },
        execute: async ({ topic }: { topic: string }) => {
            const res = await searchLectures(topic)
            return res.data
        }
    })

    // ── Tool 2: Create Lecture ────────────────────────────────────────
    document.modelContext.registerTool({
        name: 'create_lecture',
        description: `Create a new lecture/topic section in the app from a YouTube URL or directly from ChatGPT explanation.
                      Use source='youtube' when user picked a YouTube video.
                      Use source='chatgpt' when ChatGPT is explaining directly without a video.
                      This saves the lecture to the user's account and returns the lecture ID.`,
        inputSchema: {
            type: 'object',
            properties: {
                youtube_url: {
                    type:        'string',
                    description: 'YouTube URL of the lecture. Required if source is youtube.',
                },
                title: {
                    type:        'string',
                    description: 'Title of the topic or lecture.',
                },
                source: {
                    type:        'string',
                    enum:        ['youtube', 'chatgpt'],
                    description: 'Source of the lecture — youtube or chatgpt.',
                }
            },
            required: ['source', 'title'],
        },
        execute: async ({ youtube_url, title, source }: {
            youtube_url?: string
            title:        string
            source:       'youtube' | 'chatgpt'
        }) => {
            const res = await createLecture({ youtube_url, title, source })
            return res.data
        }
    })

    // ── Tool 3: Save Explanation ──────────────────────────────────────
    document.modelContext.registerTool({
        name: 'save_explanation',
        description: `Save the AI-generated explanations for a lecture to the user's account.
                      Call this AFTER generating all three levels of explanation.
                      This updates the lecture with plain English, technical, and advanced explanations,
                      key concepts, and related topics.`,
        inputSchema: {
            type: 'object',
            properties: {
                lecture_id: {
                    type:        'string',
                    description: 'The ID of the lecture returned by create_lecture.',
                },
                plain_english: {
                    type:        'string',
                    description: 'Simple plain English explanation for beginners.',
                },
                technical: {
                    type:        'string',
                    description: 'Technical explanation with proper terminology and code examples.',
                },
                advanced: {
                    type:        'string',
                    description: 'Advanced explanation covering edge cases and optimizations.',
                },
                key_concepts: {
                    type:        'array',
                    description: 'List of key concepts with title and explanation.',
                    items: {
                        type: 'object',
                        properties: {
                            title:       { type: 'string' },
                            explanation: { type: 'string' },
                        }
                    }
                },
                related_topics: {
                    type:        'array',
                    description: 'List of related topic strings the user should study next.',
                    items:       { type: 'string' }
                }
            },
            required: ['lecture_id', 'plain_english', 'technical', 'advanced'],
        },
        execute: async ({ lecture_id, plain_english, technical, advanced, key_concepts, related_topics }: {
            lecture_id:     string
            plain_english:  string
            technical:      string
            advanced:       string
            key_concepts?:  { title: string; explanation: string }[]
            related_topics?: string[]
        }) => {
            const res = await saveExplanation(lecture_id, {
                plain_english,
                technical,
                advanced,
                key_concepts,
                related_topics,
            })
            return res.data
        }
    })

    // ── Tool 4: Generate Quiz ─────────────────────────────────────────
    document.modelContext.registerTool({
        name: 'generate_quiz',
        description: `Get a prompt to generate a quiz for a specific lecture.
                      Returns a prompt that YOU (ChatGPT) should use to generate quiz questions.
                      After generating questions call save_quiz to save them.
                      Difficulty must be easy, medium, or hard.`,
        inputSchema: {
            type: 'object',
            properties: {
                lecture_id: {
                    type:        'string',
                    description: 'The ID of the lecture to generate a quiz for.',
                },
                difficulty: {
                    type:        'string',
                    enum:        ['easy', 'medium', 'hard'],
                    description: 'Difficulty level of the quiz.',
                }
            },
            required: ['lecture_id', 'difficulty'],
        },
        execute: async ({ lecture_id, difficulty }: {
            lecture_id: string
            difficulty: 'easy' | 'medium' | 'hard'
        }) => {
            const res = await getQuizPrompt({ lecture_id, difficulty })
            return res.data
        }
    })

    // ── Tool 5: Save Quiz ─────────────────────────────────────────────
    document.modelContext.registerTool({
        name: 'save_quiz',
        description: `Save generated quiz questions to the user's account.
                      Call this after YOU (ChatGPT) have generated the quiz questions
                      using the prompt from generate_quiz.
                      Questions must be in exact JSON format with question, options, correct, explanation, topic.`,
        inputSchema: {
            type: 'object',
            properties: {
                lecture_id: {
                    type:        'string',
                    description: 'The ID of the lecture this quiz belongs to.',
                },
                difficulty: {
                    type:        'string',
                    enum:        ['easy', 'medium', 'hard'],
                    description: 'Difficulty level of the quiz.',
                },
                questions: {
                    type:        'array',
                    description: 'Array of quiz questions.',
                    items: {
                        type: 'object',
                        properties: {
                            question:    { type: 'string' },
                            options:     { type: 'array', items: { type: 'string' } },
                            correct:     { type: 'number' },
                            explanation: { type: 'string' },
                            topic:       { type: 'string' },
                        }
                    }
                }
            },
            required: ['lecture_id', 'difficulty', 'questions'],
        },
        execute: async ({ lecture_id, difficulty, questions }: {
            lecture_id: string
            difficulty: string
            questions:  object[]
        }) => {
            const res = await saveQuiz({ lecture_id, difficulty, questions })
            return res.data
        }
    })

    // ── Tool 6: Submit Answer ─────────────────────────────────────────
    document.modelContext.registerTool({
        name: 'submit_answer',
        description: `Submit user's quiz answers and get the score with weak topics.
                      answers is an array of integers where each integer is the index (0-3)
                      of the option the user selected for each question.`,
        inputSchema: {
            type: 'object',
            properties: {
                quiz_id: {
                    type:        'string',
                    description: 'The ID of the quiz returned by save_quiz.',
                },
                lecture_id: {
                    type:        'string',
                    description: 'The ID of the lecture this quiz belongs to.',
                },
                answers: {
                    type:        'array',
                    description: 'Array of answer indices. e.g. [0, 2, 1, 3, 0]',
                    items:       { type: 'number' }
                }
            },
            required: ['quiz_id', 'lecture_id', 'answers'],
        },
        execute: async ({ quiz_id, lecture_id, answers }: {
            quiz_id:    string
            lecture_id: string
            answers:    number[]
        }) => {
            const res = await submitAnswer({ quiz_id, lecture_id, answers })
            return res.data
        }
    })

    // ── Tool 7: Get Weak Topics ───────────────────────────────────────
    document.modelContext.registerTool({
        name: 'get_weak_topics',
        description: `Get the user's weak topics ranked by priority based on their quiz history.
                      Use this when the user asks what they should study next,
                      or to recommend topics for improvement.
                      Returns topics ranked as high, medium, or low priority.`,
        inputSchema: {
            type:       'object',
            properties: {},
            required:   [],
        },
        execute: async () => {
            const res = await getWeakTopics()
            return res.data
        }
    })

    // ── Tool 8: Get All Lectures ──────────────────────────────────────
    document.modelContext.registerTool({
        name: 'get_all_lectures',
        description: `Get all lectures and topics the user has studied so far.
                      Use this to show the user their learning history or
                      to find a specific lecture ID for quiz generation.`,
        inputSchema: {
            type:       'object',
            properties: {},
            required:   [],
        },
        execute: async () => {
            const res = await getAllLectures()
            return res.data
        }
    })

    console.log('✅ WebMCP tools registered successfully')
}

export default registerTools