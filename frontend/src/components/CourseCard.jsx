import { Link } from 'react-router-dom';
import { FiStar, FiHeart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
<<<<<<< HEAD
import { formatViews } from '../services/formatViews';
=======
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87

const CourseCard = ({ course, onWishlistToggle, isWishlisted }) => {
  const { addToCart } = useCart();
  const finalPrice = course.discountPrice > 0 ? course.discountPrice : course.price;
  const hasDiscount = course.discountPrice > 0 && course.discountPrice < course.price;

  return (
    <div className="card overflow-hidden flex flex-col group">
<<<<<<< HEAD
      <Link to={`/courses/${course.slug}`} className="relative block aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
=======
      <Link to={`/courses/${course.slug}`} className="block aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No thumbnail</div>
        )}
<<<<<<< HEAD
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1">
          <FiStar className="text-yellow-400 fill-yellow-400" size={12} />
          {course.ratingAverage > 0 ? (
            <>
              {course.ratingAverage.toFixed(1)}
              <span className="text-gray-300">({course.ratingCount})</span>
            </>
          ) : (
            'New'
          )}
        </div>
=======
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-primary-600 font-medium uppercase">{course.category}</span>
        <Link to={`/courses/${course.slug}`} className="font-semibold mt-1 line-clamp-2 hover:text-primary-600">
          {course.title}
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{course.instructor?.name}</p>

        <div className="flex items-center gap-1 mt-2 text-sm">
          <FiStar className="text-yellow-500 fill-yellow-500" />
          <span className="font-medium">{course.ratingAverage?.toFixed(1) || 'New'}</span>
          <span className="text-gray-400">({course.ratingCount || 0})</span>
<<<<<<< HEAD
          <span className="text-gray-400">&middot; {formatViews(course.totalViews)}</span>
=======
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div>
            <span className="font-bold text-lg">₹{finalPrice}</span>
            {hasDiscount && <span className="text-gray-400 line-through text-sm ml-2">₹{course.price}</span>}
          </div>
          <div className="flex gap-2">
            {onWishlistToggle && (
              <button onClick={() => onWishlistToggle(course._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <FiHeart className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
              </button>
            )}
            <button onClick={() => addToCart(course)} className="btn-primary text-sm px-3 py-1.5">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
