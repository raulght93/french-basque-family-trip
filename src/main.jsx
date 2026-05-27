import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import BasqueGuide from './BasqueGuide.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BasqueGuide />
  </StrictMode>
)
