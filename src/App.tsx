import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ProjectManagerDashboard from './pages/ProjectManagerDashboard'
import CreateProject from './pages/CreateProject'
import ContractorInterface from './pages/ContractorInterface'
import ChatInterface from './pages/ChatInterface'
import ProjectDetails from './pages/ProjectDetails'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pm-dashboard" element={<ProjectManagerDashboard />} />
          <Route path="/create-project" element={<CreateProject />} />
          <Route path="/contractor" element={<ContractorInterface />} />
          <Route path="/chat/:projectId" element={<ChatInterface />} />
          <Route path="/project/:projectId" element={<ProjectDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App