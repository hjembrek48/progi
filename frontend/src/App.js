import { BrowseRouter, Route, Routes } from 'react-router-dom';ž
import { Add_game } from './pages/Add_game.jsx';
import { Homepage } from './pages/Homepage.jsx';
import { Profilepage } from './pages/Profilepage.jsx';
import { Loginpage } from './pages/Loginpage.jsx';

function App() {
  return (
    <BrowseRouter>
      <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path='/login' element={<Loginpage />} />
          <Route path='/profile' element={<Profilepage />} />
          <Route path='/profile/add_game' element={<Add_game />} />
      </Routes>
    </BrowseRouter>
  );
}

export default App;
