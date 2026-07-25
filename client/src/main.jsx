import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import Providers from './theme/Providers'
import App from './App'
import router from './router'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Providers>
      <App>
        <RouterProvider router={router}/>
      </App>
    </Providers>
  </StrictMode>
)
