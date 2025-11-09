import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Add_game } from './pages/Add_game.jsx';
import { Homepage } from './pages/Homepage.jsx';
import { Profilepage } from './pages/Profilepage.jsx';
import { Loginpage } from './pages/Loginpage.jsx';
import { Login_add_location } from './pages/Login_add_location.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css'
import { ProtectedRoute } from './components/ProtectedRoute.jsx';


function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path='/login' element={<Loginpage />} />
          <Route path='/login/add_location' element={
            <ProtectedRoute>
              <Login_add_location />
            </ProtectedRoute>} />
          <Route path='/profile' element={
            <ProtectedRoute>
              <Profilepage />
            </ProtectedRoute>} />
          <Route path='/profile/add_game' element={
            <ProtectedRoute>
              <Add_game />
            </ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
