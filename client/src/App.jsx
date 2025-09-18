import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import GroupPage from "./pages/GroupPage"
import Groups from "./pages/Groups"
import ReviewsPage from "./pages/ReviewsPage"
import HomePage from "./pages/HomePage"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import SearchResultsPage from "./pages/SearchResultsPage"
import ShowTimesPage from "./pages/ShowTimesPage"
import LoginPage from "./pages/LoginPage"
import SignUpPage from "./pages/SignupPage"

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
            paddingTop: "70px",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/homepage" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/schedule" element={<ShowTimesPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
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