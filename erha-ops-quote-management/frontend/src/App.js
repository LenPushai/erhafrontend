import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import QuoteList from './pages/QuoteList';
import QuoteForm from './pages/QuoteForm';
import QuoteView from './pages/QuoteView';
import Analytics from './pages/Analytics';

/**
 * 💰 ERHA Quote Management App
 * Professional quote creation, approval, and client communication
 */
function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container-fluid mt-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quotes" element={<QuoteList />} />
            <Route path="/quotes/new" element={<QuoteForm />} />
            <Route path="/quotes/edit/:id" element={<QuoteForm />} />
            <Route path="/quotes/view/:id" element={<QuoteView />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
