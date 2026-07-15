import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/my-courses').then((res) => setCourses(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet><title>My Courses - EduStream</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">My Courses</h1>
        {loading ? (
          <p>Loading...</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-500">No courses yet. <Link to="/courses" className="text-primary-600 font-medium">Browse courses</Link></p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((e) => (
              <Link key={e.course?._id} to={`/watch/${e.course?.slug}`} className="card overflow-hidden">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                  {e.course?.thumbnail && <img src={e.course.thumbnail} className="w-full h-full object-cover" alt={e.course.title} />}
                </div>
                <div className="p-4">
                  <p className="font-medium line-clamp-2">{e.course?.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{e.course?.instructor?.name}</p>
                  <p className="text-xs text-gray-400 mt-2">Enrolled {new Date(e.enrolledAt).toLocaleDateString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyCourses;
