import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import Keys from './Keys.jsx'
import CreateKey from './CreateKey.jsx'
import KeyInfo from './KeyInfo.jsx'
import EditKey from './EditKey.jsx'
import RequestForms from './RequestForms.jsx'
import AddRequestForm from './AddRequestForm.jsx'
import EditRequestForm from './EditRequestForm.jsx'
import HistoryLog from './HistoryLog.jsx'
import Users from './Users.jsx'
import NavBar from './NavBar.jsx'
import AddUser from './AddUser.jsx'
import EditUser from './EditUser.jsx'
import Settings from './Settings.jsx'

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            exact
            path='/'
            element={<Keys />}
          />
          <Route
            exact
            path='/requestforms'
            element={<RequestForms />}
          />
          <Route 
            exact
            path='/historylog'
            element={<HistoryLog />}
          />
          <Route
            exact
            path='/users'
            element={<Users />}
          />
          <Route
            exact
            path='/adduser'
            element={<AddUser />}
          />
          <Route
            exact
            path='/edituser'
            element={<EditUser />}
          />
          <Route
            exact
            path='/editrequestform'
            element={<EditRequestForm />}
          />
          <Route
            exact
            path='/createkey'
            element={<CreateKey />}
          />
          <Route
            exact
            path='/keyinfo'
            element={<KeyInfo />}
          />
          <Route
            exact
            path='/editkey'
            element={<EditKey />}
          />
          <Route
            exact
            path='/addrequestform'
            element={<AddRequestForm />}
          />
          <Route
            exact
            path='/settings'
            element={<Settings />}
          />
          <Route
            exact
            path='/navbar'
            element={<NavBar />}
          />
          <Route /* default route */
            path='*'
            element={<Navigate to='/' />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App