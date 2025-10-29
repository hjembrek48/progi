import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Add_game } from './pages/Add_game.jsx';
import { Homepage } from './pages/Homepage.jsx';
import { Profilepage } from './pages/Profilepage.jsx';
import { Loginpage } from './pages/Loginpage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path='/login' element={<Loginpage />} />
          <Route path='/profile' element={<Profilepage />} />
          <Route path='/profile/add_game' element={<Add_game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
