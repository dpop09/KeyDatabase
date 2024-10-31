import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import { AuthContext, AuthProvider } from './AuthContext'
import Home from './Home.jsx'
import Signin from './Signin.jsx'
import KeyInfo from './KeyInfo.jsx'

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            exact
            path='/'
            element={<Signin />}
          />
          <Route
            exact
            path='/home'
            element={<Home />}
          />
          <Route
            exact
            path='/keyinfo'
            element={<KeyInfo />}
          />
          <Route
            path='*'
            element={<Navigate to='/' />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App