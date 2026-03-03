import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Layout } from './components/layout/Layout';
import Marketplace from './pages/MarketPlace';
import Subscription from './pages/Subscription';
import Success from './pages/Success';
import { PdfReader } from './pages/PdfReader';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Protected Routes (Mocked) */}
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="subscription" element={<Subscription />} />
          </Route>

          <Route path="/read" element={<PdfReader />} />
          <Route path="/success" element={<Success />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;