import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SavedProvider } from './context/SavedContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { ChatPage } from './pages/ChatPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { ComparePage } from './pages/ComparePage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SavedProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors duration-200">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/properties/:id" element={<PropertyDetailPage />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/student" element={<StudentDashboardPage />} />
                  <Route path="/owner" element={<OwnerDashboardPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </SavedProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
