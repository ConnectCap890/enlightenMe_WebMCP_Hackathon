import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import registerTools from './webmcp'

// Register WebMCP tools when app loads
if ('modelContext' in document) {
    registerTools()
} else {
    console.log('WebMCP not available — running in normal browser mode')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)