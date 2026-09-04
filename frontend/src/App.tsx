import Navbar from './components/Navbar'
import AppRoutes from './routes/AppRoutes'
import { useEnlightenMeTools } from './hooks/useEnlightenMeTool'


function App() {
    useEnlightenMeTools()
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Navbar />
            <AppRoutes />
        </div>
    )
}

export default App