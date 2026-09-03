import { useState, useEffect } from 'react'
import { getUser, isLoggedIn, logout, saveAuth} from '../utils/auth'
import type { User } from '../utils/auth'
import { loginUser, registerUser, getProfile } from '../utils/api'

interface Stats {
    quizzes_taken: number
    average_score: number
    best_score:    number
    total_topics:  number
}

interface AuthState {
    user:     User | null
    stats:    Stats | null
    loading:  boolean
    error:    string | null
}

export const useAuth = () => {
    const [state, setState] = useState<AuthState>({
        user:    getUser(),
        stats:   null,
        loading: false,
        error:   null,
    })

    const setError = (error: string | null) =>
        setState(prev => ({ ...prev, error }))

    const setLoading = (loading: boolean) =>
        setState(prev => ({ ...prev, loading }))

    const login = async (email: string, password: string) => {
        setLoading(true)
        setError(null)
        try {
            const res = await loginUser({ email, password })
            saveAuth(res.data.user, res.data.tokens)
            setState(prev => ({
                ...prev,
                user:    res.data.user,
                loading: false,
            }))
            return true
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed')
            setLoading(false)
            return false
        }
    }

    const register = async (
        username: string,
        email:    string,
        password: string
    ) => {
        setLoading(true)
        setError(null)
        try {
            await registerUser({ username, email, password })
            setLoading(false)
            return true
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed')
            setLoading(false)
            return false
        }
    }

    const fetchProfile = async () => {
        if (!isLoggedIn()) return
        try {
            const res = await getProfile()
            setState(prev => ({
                ...prev,
                user:  res.data.user,
                stats: res.data.stats,
            }))
        } catch (err) {
            logout()
        }
    }

    useEffect(() => {
        if (isLoggedIn()) {
            fetchProfile()
        }
    }, [])

    return {
        user:     state.user,
        stats:    state.stats,
        loading:  state.loading,
        error:    state.error,
        login,
        register,
        logout,
        isLoggedIn: isLoggedIn(),
    }
}