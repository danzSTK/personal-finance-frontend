import { BrowserRouter } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider'
import { AppRoutes } from './routes'

function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <AppRoutes />
      </QueryProvider>
    </BrowserRouter>
  )
}

export default App
