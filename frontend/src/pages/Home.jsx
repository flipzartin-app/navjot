import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import CourseCard from '../components/CourseCard';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/courses?sort=popular&limit=8'),
      api.get('/courses/categories/list'),
    ])
      .then(([coursesRes, catRes]) => {
        setFeatured(coursesRes.data.courses);
        setCategories(catRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>EduStream - Learn New Skills Online</title>
        <meta name="description" content="Browse expert-led video courses in tech, design, business and more." />
      </Helmet>

      <section className="bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Learn Without Limits</h1>
          <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
            Access thousands of hours of video courses taught by industry experts.
          </p>
          <Link to="/courses" className="bg-white text-primary-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100">
            Explore Courses
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold mb-6">Browse by Category</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/courses?category=${encodeURIComponent(cat._id)}`}
              className="card px-4 py-2 text-sm hover:border-primary-500"
            >
              {cat._id} <span className="text-gray-400">({cat.count})</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Featured Courses</h2>
          <Link to="/courses" className="text-primary-600 text-sm font-medium">View all &rarr;</Link>
        </div>
        {loading ? (
          <p>Loading courses...</p>
        ) : featured.length === 0 ? (
          <p className="text-gray-500">No courses published yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default Home;
