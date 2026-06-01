import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CourseRecommender from './pages/CourseRecommender';
import EligibilityChecker from './pages/EligibilityChecker';
import Scholarships from './pages/Scholarships';
import Compare from './pages/Compare';
import Navigate from './pages/Navigate';
import AdminDashboard from './pages/AdminDashboard';
import DocumentUpload from './pages/DocumentUpload';

function App() {
  return (
    <>
      {/* Toast notifications */}
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(13, 10, 30, 0.95)',
              color: '#fff',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              backdropFilter: 'blur(12px)',
              fontSize: '14px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#a855f7', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#f43f5e', secondary: '#fff' },
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />
          <Route
            path="/login"
            element={
              <MainLayout>
                <Login />
              </MainLayout>
            }
          />
          <Route
            path="/signup"
            element={
              <MainLayout>
                <Signup />
              </MainLayout>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommend"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CourseRecommender />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/eligibility"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EligibilityChecker />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/scholarships"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Scholarships />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Compare />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/navigate"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Navigate />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/documents"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DocumentUpload />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <MainLayout>
                <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                  <h1 className="font-display font-bold text-8xl text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-blue-400 mb-4">
                    404
                  </h1>
                  <p className="text-gray-400 text-xl mb-6">Page not found</p>
                  <a href="/" className="btn-primary">Go Home</a>
                </div>
              </MainLayout>
            }
          />
        </Routes>
    </>
  );
}

export default App;
