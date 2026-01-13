import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Homepage } from './pages/Homepage.jsx';
import { Profilepage } from './pages/Profilepage.jsx';
import { Loginpage } from './pages/Loginpage.jsx';
import { Login_add_location } from './pages/Login_add_location.jsx';
import { MyGames } from './pages/MyGames.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css'
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AuthProvider } from './components/AuthProvider.jsx';
import { RestrictedRoute } from './components/RestrictedRoute.jsx';
import { CategoryWishlist } from './components/CategoryWishlist.jsx';
import SearchPage from './pages/SearchPage.jsx';
import ListingPage from './pages/ListingPage.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
            <Route path='/' element={<Homepage />} />
            <Route path='/login' element={<Loginpage />} />
            <Route path="/my-games" element={<MyGames/>}/>
            <Route path="/category-wishlist" element={<CategoryWishlist />}></Route>
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
            <Route path='/my_games' element={
              <ProtectedRoute minStep={3}>
                <MyGames />
              </ProtectedRoute>} />
            <Route path='/search' element={<SearchPage/>}/>
            <Route path='/listing/:listingId' element={<ListingPage/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
