import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Tracks which course IDs are on the logged-in user's wishlist, and exposes a toggle function.
// Used by any page that shows course cards (Home, Courses, Course Details) so the heart icon
// state stays consistent without each page re-implementing the fetch/toggle logic.
export const useWishlist = () => {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const refresh = useCallback(() => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      return;
    }
    api
      .get('/wishlist')
      .then((res) => setWishlistIds(new Set(res.data.courses.map((c) => c._id))))
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = async (courseId) => {
    if (!isAuthenticated) {
      toast.error('Log in to save courses to your wishlist');
      return;
    }
    try {
      const { data } = await api.post('/wishlist/toggle', { courseId });
      toast.success(data.added ? 'Added to wishlist' : 'Removed from wishlist');
      refresh();
    } catch {
      toast.error('Could not update wishlist');
    }
  };

  return { wishlistIds, toggle };
};
