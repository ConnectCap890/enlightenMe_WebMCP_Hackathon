import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// If token expired automatically logout
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Auth 
export const registerUser = (data: {
    username: string
    email: string
    password: string
}) => api.post('/api/users/register/', data)

export const loginUser = (data: {
    email: string
    password: string
}) => api.post('/api/users/login/', data)

export const getProfile = () => api.get('/api/users/profile/')
export const getProgress = () => api.get('/api/users/progress/')

//Lectures
export const searchLectures = (topic: string) =>
    api.post('/api/lectures/search/', { topic })

export const createLecture = (data: {
    youtube_url?: string
    title?: string
    source: 'youtube' | 'chatgpt'
}) => api.post('/api/lectures/create/', data)

export const saveExplanation = (lectureId: string, data: {
    plain_english?: string
    technical?: string
    advanced?: string
    key_concepts?: { title: string; explanation: string }[]
    related_topics?: string[]
}) => api.post(`/api/lectures/${lectureId}/save/`, data)

export const getAllLectures = () => api.get('/api/lectures/all/')
export const getLecture = (id: string) => api.get(`/api/lectures/${id}/`)
export const deleteLecture = (id: string) => api.delete(`/api/lectures/${id}/delete/`)

// Quizzes 
export const getQuizPrompt = (data: {
    lecture_id: string
    difficulty: 'easy' | 'medium' | 'hard'
}) => api.post('/api/quizzes/prompt/', data)

export const saveQuiz = (data: {
    lecture_id: string
    difficulty: string
    questions: object[]
}) => api.post('/api/quizzes/save/', data)

export const submitAnswer = (data: {
    quiz_id: string
    lecture_id: string
    answers: number[]
}) => api.post('/api/quizzes/submit/', data)

export const getWeakTopics = () => api.get('/api/quizzes/weak-topics/')
export const getQuiz = (id: string) => api.get(`/api/quizzes/${id}/`)