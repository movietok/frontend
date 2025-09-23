import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProfilePage from "./pages/ProfilePage"
import Groups from "./pages/Groups"
import BrowsePage from "./pages/BrowsePage"
import HomePage from "./pages/HomePage"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import SearchResultsPage from "./pages/SearchResultsPage"
import ShowTimesPage from "./pages/ShowTimesPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import ReviewsPage from "./pages/ReviewsPage"

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
            textAlign: "center",
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/homepage" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/schedule" element={<ShowTimesPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/browse" element={<BrowsePage />} />   
            <Route path="/groups" element={<Groups />} />            
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App













/*
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
//import HomePage from "./pages/HomePage"
import SearchResultsPage from "./pages/SearchResultsPage";
import ShowTimesPage from "./pages/ShowTimesPage"

//import { useState } from 'react'
import './App.css'

function App() {

  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ padding: "1rem" }}>
        <Routes>
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/schedule" element={<ShowTimesPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
*/