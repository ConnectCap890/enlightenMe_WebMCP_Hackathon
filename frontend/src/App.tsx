import Navbar from './components/Navbar'
import AppRoutes from './routes/AppRoutes.'

function App() {
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <AppRoutes />
        </div>
    )
}

export default App