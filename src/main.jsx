import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// THIS LINE FIXES THE BLACK/BLANK SCREEN ISSUE
import '@rainbow-me/rainbowkit/styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)