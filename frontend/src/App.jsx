import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import WatchVideo from './pages/WatchVideo';
import Login from './pages/Login';
import Register from './pages/Register';
<<<<<<< HEAD
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
=======
import Dashboard from './pages/Dashboard';
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87
import MyCourses from './pages/MyCourses';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import InstructorPanel from './pages/InstructorPanel';
import AdminPanel from './pages/AdminPanel';
import Contact from './pages/Contact';
import About from './pages/About';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:slug" element={<CourseDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
<<<<<<< HEAD
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
=======
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />

          <Route path="/watch/:slug" element={<ProtectedRoute><WatchVideo /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
<<<<<<< HEAD
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
=======
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87
          <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/checkout/success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />

          <Route path="/instructor" element={<RoleRoute roles={['instructor', 'admin']}><InstructorPanel /></RoleRoute>} />
          <Route path="/admin" element={<RoleRoute roles={['admin']}><AdminPanel /></RoleRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
