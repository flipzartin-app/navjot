import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import api from '../services/api';
import CourseCard from '../components/CourseCard';

const Wishlist = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/wishlist').then((res) => setCourses(res.data.courses)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (courseId) => {
    try {
      await api.post('/wishlist/toggle', { courseId });
      toast.success('Removed from wishlist');
      load();
    } catch {
      toast.error('Could not update wishlist');
    }
  };

  return (
    <>
      <Helmet><title>My Wishlist - EduStream</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">My Wishlist</h1>
        {loading ? (
          <p>Loading...</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-500">Your wishlist is empty.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} onWishlistToggle={handleToggle} isWishlisted />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist;
