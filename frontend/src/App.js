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
import { Marketplace } from './pages/Marketplace.jsx';
import { GameExchange } from './pages/GameExchange.jsx';
import { EditOffer } from './pages/EditOffer.jsx';
import { OffersList } from './pages/OffersList.jsx';
import { OfferDetail } from './pages/OfferDetail.jsx';
import SearchPage from './pages/SearchPage.jsx';
import { MyTrades } from './pages/MyTrades.jsx';
import { CategoryWishlist } from './components/CategoryWishlist.jsx';
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
            <Route path='/marketplace' element={
              <ProtectedRoute minStep={3}>
                <Marketplace />
              </ProtectedRoute>} />
            <Route path='/gameexchange' element={
              <ProtectedRoute minStep={3} >
                <GameExchange />
              </ProtectedRoute>} />
            <Route path='/offers' element={
              <ProtectedRoute minStep={3}>
                <OffersList />
              </ProtectedRoute>} />
            <Route path='/offers/:id' element={
              <ProtectedRoute minStep={3}>
                <OfferDetail />
              </ProtectedRoute>} />
            <Route path='/offers/:id/edit' element={
              <ProtectedRoute minStep={3}>
                <EditOffer />
              </ProtectedRoute>} />
            <Route path='/mytrades' element={
              <ProtectedRoute minStep={3}>
                <MyTrades />
              </ProtectedRoute>} />
            <Route path='/search' element={
              <ProtectedRoute minStep={3}>
                <SearchPage/>
              </ProtectedRoute>}/>
            <Route path='/listing/:listingId' element={
              <ProtectedRoute minStep={3}>
                <ListingPage/>
              </ProtectedRoute>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
