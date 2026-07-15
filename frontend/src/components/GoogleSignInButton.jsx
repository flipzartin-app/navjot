import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

// Loads Google's Identity Services script once, on demand (same pattern as the Razorpay loader).
const loadGoogleScript = () =>
  new Promise((resolve) => {
    if (window.google?.accounts?.id) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// Renders Google's own "Sign in with Google" button and calls onSuccess(idToken) once the
// user completes the Google popup. If VITE_GOOGLE_CLIENT_ID isn't configured, the button
// area shows a small setup note instead of silently doing nothing.
const GoogleSignInButton = ({ onSuccess }) => {
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    loadGoogleScript().then((loaded) => {
      if (cancelled || !loaded || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) {
            onSuccess(response.credential);
          } else {
            toast.error('Google sign-in did not return a credential - please try again');
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [clientId, onSuccess]);

  if (!clientId) {
    return (
      <p className="text-xs text-gray-400 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-lg py-3">
        Google Sign-In isn't configured yet (missing VITE_GOOGLE_CLIENT_ID in frontend/.env)
      </p>
    );
  }

  return <div ref={buttonRef} className="flex justify-center" />;
};

export default GoogleSignInButton;
