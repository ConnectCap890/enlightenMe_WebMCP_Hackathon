export interface User {
    id:         string
    username:   string
    email:      string
    created_at: string
}

export interface AuthTokens {
    access:  string
    refresh: string
}

export interface User {
    id:         string
    username:   string
    email:      string
    created_at: string
}
export const saveAuth = (user: User, tokens: AuthTokens) => {
    localStorage.setItem('access_token',  tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    localStorage.setItem('user',          JSON.stringify(user))
}

export const getUser = (): User | null => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
}

export const getToken = (): string | null => {
    return localStorage.getItem('access_token')
}

export const isLoggedIn = (): boolean => {
    return !!localStorage.getItem('access_token')
}

export const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    window.location.href = '/login'
}

