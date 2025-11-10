import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Add_game } from './pages/Add_game.jsx';
import { Homepage } from './pages/Homepage.jsx';
import { Profilepage } from './pages/Profilepage.jsx';
import { Loginpage } from './pages/Loginpage.jsx';
import { Login_add_location } from './pages/Login_add_location.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css'
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AuthProvider } from './components/AuthProvider.jsx';
import { RestrictedRoute } from './components/RestrictedRoute.jsx';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
            <Route path='/' element={<Homepage />} />
            <Route path='/login' element={<Loginpage />} />
            <Route path='/login/add_location' element={
              <ProtectedRoute minStep={2}>
                <RestrictedRoute maxStep={2}>
                  <Login_add_location />
                </RestrictedRoute>
              </ProtectedRoute>} />
            <Route path='/profile' element={
              <ProtectedRoute minStep={3}>
                <Profilepage />
              </ProtectedRoute>} />
            <Route path='/profile/add_game' element={
              <ProtectedRoute minStep={3}>
                  <Add_game />
              </ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
