import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Routes, Route, Link } from "react-router-dom";
import { DigitalEventsPage } from './Pages/DigitalEventsPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cms" element={<DigitalEventsPage />} />
      </Routes>
    </div>
  );
}

const Home = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h1>Home</h1>
      <nav>
        <Link style={{ fontSize: 30 }} to="/cms">CMS</Link>
      </nav>
    </div>
  )
}


export default App;
