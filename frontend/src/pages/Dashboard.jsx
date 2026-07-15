import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState([]);

  useEffect(() => {
    api.get('/users/my-courses').then((res) => setMyCourses(res.data));
  }, []);

  const inProgress = myCourses.slice(0, 4);

  return (
    <>
      <Helmet><title>My Dashboard - EduStream</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-gray-500 mb-8">Here's where you left off.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="card p-5"><p className="text-2xl font-bold">{myCourses.length}</p><p className="text-sm text-gray-500">Enrolled Courses</p></div>
          <div className="card p-5"><p className="text-2xl font-bold">-</p><p className="text-sm text-gray-500">Certificates Earned</p></div>
          <Link to="/wishlist" className="card p-5 hover:border-primary-500"><p className="text-2xl font-bold">&hearts;</p><p className="text-sm text-gray-500">View Wishlist</p></Link>
          <Link to="/courses" className="card p-5 hover:border-primary-500"><p className="text-2xl font-bold">+</p><p className="text-sm text-gray-500">Browse Courses</p></Link>
        </div>

        <h2 className="text-lg font-bold mb-4">Continue Learning</h2>
        {inProgress.length === 0 ? (
          <p className="text-gray-500">You haven't enrolled in any courses yet. <Link to="/courses" className="text-primary-600 font-medium">Browse courses</Link></p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {inProgress.map((e) => (
              <Link key={e.course?._id} to={`/watch/${e.course?.slug}`} className="card overflow-hidden">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                  {e.course?.thumbnail && <img src={e.course.thumbnail} className="w-full h-full object-cover" alt={e.course.title} />}
                </div>
                <div className="p-4">
                  <p className="font-medium line-clamp-2">{e.course?.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{e.course?.instructor?.name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
