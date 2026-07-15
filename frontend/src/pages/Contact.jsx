import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // NOTE: no backend endpoint wired for this yet - hook this up to an email service
    // (e.g. Nodemailer via a /api/contact route) before relying on it in production.
    setSent(true);
    toast.success('Message received (demo only - not yet wired to a backend)');
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - EduStream</title>
        <meta name="description" content="Get in touch with the EduStream team." />
      </Helmet>
      <div className="max-w-xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        {sent ? (
          <p className="text-green-600">Thanks for reaching out! We'll get back to you soon.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
            <input required type="email" placeholder="Your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
            <textarea required rows={5} placeholder="Your message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field" />
            <button type="submit" className="btn-primary w-full">Send Message</button>
          </form>
        )}
      </div>
    </>
  );
};

export default Contact;
