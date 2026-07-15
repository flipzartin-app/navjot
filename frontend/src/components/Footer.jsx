import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-16">
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
      <div>
        <h3 className="font-bold text-primary-600 text-lg mb-3">EduStream</h3>
        <p className="text-gray-500 dark:text-gray-400">Learn in-demand skills from expert instructors, anytime, anywhere.</p>
      </div>
      <div>
        <h4 className="font-semibold mb-3">Company</h4>
        <ul className="space-y-2 text-gray-500 dark:text-gray-400">
          <li><Link to="/about" className="hover:text-primary-600">About</Link></li>
          <li><Link to="/contact" className="hover:text-primary-600">Contact</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-3">Learn</h4>
        <ul className="space-y-2 text-gray-500 dark:text-gray-400">
          <li><Link to="/courses" className="hover:text-primary-600">All Courses</Link></li>
          <li><Link to="/register" className="hover:text-primary-600">Become an Instructor</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-3">Legal</h4>
        <ul className="space-y-2 text-gray-500 dark:text-gray-400">
          <li>Terms of Service</li>
          <li>Privacy Policy</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-gray-200 dark:border-gray-800 py-4 text-center text-xs text-gray-400">
      &copy; {new Date().getFullYear()} EduStream. All rights reserved.
    </div>
  </footer>
);

export default Footer;
