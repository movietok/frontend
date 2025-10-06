import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProfilePage from "./pages/ProfilePage"
import BrowseGroupsPage from "./pages/BrowseGroupsPage"
import BrowsePage from "./pages/BrowsePage"
import HomePage from "./pages/HomePage"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import SearchResultsPage from "./pages/SearchResultsPage"
import ShowTimesPage from "./pages/ShowTimesPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import ReviewsPage from "./pages/ReviewsPage"
import MovieDetailsPage from "./pages/MovieDetailsPage";
import FavoritesPage from "./pages/FavoritesPage";
import SettingsPage from "./pages/SettingsPage";
import CreateGroupPage from "./pages/CreateGroupPage";
import GroupDetailsPage from "./pages/GroupDetailsPage";

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />

          <main
          style={{
            flex: 1,
            maxWidth: "1280px",
            margin: "0 auto",
            paddingTop: "80px", // Lisää tilaa Navbarille
            paddingLeft: "2rem",
            paddingRight: "2rem", 
            paddingBottom: "2rem",
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/homepage" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />  
            <Route path="/schedule" element={<ShowTimesPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/browse" element={<BrowsePage />} />   
            <Route path="/groups" element={<BrowseGroupsPage />} />       
            <Route path="/movie/:id" element={<MovieDetailsPage />} />
            <Route path="/groups/:id" element={<GroupDetailsPage />} />
            <Route path="/groups/create" element={<CreateGroupPage />} />
     
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App