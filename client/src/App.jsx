import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import HomePage from "./pages/HomePage"
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
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/schedule" element={<ShowTimesPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
