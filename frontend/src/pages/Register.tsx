import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Register = () => {
    const navigate                    = useNavigate()
    const { register, loading, error } = useAuth()

    const [form, setForm] = useState({
        username: '',
        email:    '',
        password: '',
        confirm:  '',
    })

    const [localError, setLocalError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLocalError(null)

        if (form.password !== form.confirm) {
            setLocalError('Passwords do not match')
            return
        }

        if (form.password.length < 8) {
            setLocalError('Password must be at least 8 characters')
            return
        }

        const success = await register(form.username, form.email, form.password)
        if (success) navigate('/login')
    }

    const displayError = localError || error

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-8">
                    <span className="text-5xl">🎓</span>
                    <h1 className="text-3xl font-bold text-white mt-4">
                        Create Account
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Start your learning journey
                    </p>
                </div>

                {/* Form */}
                <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                    {displayError && (
                        <div className="bg-red-900/30 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
                            {displayError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="coollearner"
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirm"
                                value={form.confirm}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-gray-400 text-sm mt-6">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="text-indigo-400 hover:text-indigo-300"
                        >
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register