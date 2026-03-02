import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-stone-950 relative overflow-hidden">
        {/* Global Abstract Background Elements */}
        {/* Animated Orbs */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none animate-blob"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-blob animation-delay-2000"></div>
        <div className="fixed top-[40%] left-[20%] w-[30%] h-[30%] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none animate-blob animation-delay-4000"></div>
        {/* Subtle Grid Overlay */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none"></div>

        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile/:userId?" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/create-post" element={
              <PrivateRoute>
                <CreatePost />
              </PrivateRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
