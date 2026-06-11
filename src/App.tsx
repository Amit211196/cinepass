import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Home } from './pages/Home';
import { MovieDetail } from './pages/MovieDetail';
import { SeatSelection } from './pages/SeatSelection';
import { BookingConfirmation } from './pages/BookingConfirmation';
import { MyBookings } from './pages/MyBookings';
import { AdminPanel } from './pages/AdminPanel';
import { LoginRegister } from './pages/LoginRegister';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/movies/:id" element={<MovieDetail />} />
                <Route path="/book/:showtimeId" element={<SeatSelection />} />
                <Route path="/login" element={<LoginRegister />} />

                {/* Authenticated User Routes */}
                <Route 
                  path="/confirm-booking" 
                  element={
                    <ProtectedRoute>
                      <BookingConfirmation />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/my-bookings" 
                  element={
                    <ProtectedRoute>
                      <MyBookings />
                    </ProtectedRoute>
                  } 
                />

                {/* Admin Only Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminPanel />
                    </ProtectedRoute>
                  } 
                />

                {/* Wildcard Fallback */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
