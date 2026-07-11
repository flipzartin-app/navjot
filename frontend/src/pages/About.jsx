import { Helmet } from 'react-helmet-async';

const About = () => (
  <>
    <Helmet>
      <title>About Us - EduStream</title>
      <meta name="description" content="Learn about EduStream's mission to make quality education accessible." />
    </Helmet>
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">About EduStream</h1>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
        EduStream is an online learning platform connecting students with expert instructors across
        technology, business, design, and more. Our mission is to make high-quality, practical education
        accessible to anyone, anywhere.
      </p>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        Whether you're picking up a new skill for your career or exploring a personal interest,
        our video-based courses, hands-on projects, and completion certificates are designed to
        help you learn at your own pace.
      </p>
    </div>
  </>
);

export default About;
