import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './Components/App'
import './index.css'
import { ChatProvider } from './Virtual/hooks/useChat'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChatProvider>
      <App />
    </ChatProvider>
  </React.StrictMode>
)
