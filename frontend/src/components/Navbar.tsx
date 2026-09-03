import { Link, useNavigate } from 'react-router-dom'
import { isLoggedIn, logout, getUser } from '../utils/auth'

const Navbar = () => {
    const navigate  = useNavigate()
    const loggedIn  = isLoggedIn()
    const user      = getUser()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-2xl">🎓</span>
                    <span className="text-xl font-bold text-white">
                        Enlighten Me
                    </span>
                </Link>

                {/* Right Side */}
                <div className="flex items-center gap-4">
                    {loggedIn ? (
                        <>
                            <span className="text-gray-400 text-sm">
                                👋 {user?.username}
                            </span>
                            <Link
                                to="/"
                                className="text-gray-300 hover:text-white text-sm"
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-gray-300 hover:text-white text-sm"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar