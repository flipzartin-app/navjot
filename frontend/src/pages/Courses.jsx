import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import CourseCard from '../components/CourseCard';

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const level = searchParams.get('level') || '';
  const sort = searchParams.get('sort') || '';

  useEffect(() => {
    api.get('/courses/categories/list').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { search, category, level, sort, page };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    api
      .get('/courses', { params })
      .then((res) => {
        setCourses(res.data.courses);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  }, [search, category, level, sort, page]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setPage(1);
    setSearchParams(next);
  };

  return (
    <>
      <Helmet>
        <title>All Courses - EduStream</title>
        <meta name="description" content="Browse and filter our full catalog of video courses." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 space-y-6">
          <div>
            <h3 className="font-semibold mb-2 text-sm">Category</h3>
            <select className="input-field" value={category} onChange={(e) => updateFilter('category', e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c._id}</option>
              ))}
            </select>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-sm">Level</h3>
            <select className="input-field" value={level} onChange={(e) => updateFilter('level', e.target.value)}>
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-sm">Sort By</h3>
            <select className="input-field" value={sort} onChange={(e) => updateFilter('sort', e.target.value)}>
              <option value="">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </aside>

        <div className="md:col-span-3">
          <p className="text-sm text-gray-500 mb-4">{total} course{total !== 1 ? 's' : ''} found</p>
          {loading ? (
            <p>Loading...</p>
          ) : courses.length === 0 ? (
            <p className="text-gray-500">No courses match your filters.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
          {total > 12 && (
            <div className="flex justify-center gap-2 mt-8">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary disabled:opacity-40">Prev</button>
              <span className="px-4 py-2">{page}</span>
              <button disabled={page * 12 >= total} onClick={() => setPage((p) => p + 1)} className="btn-secondary disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Courses;
