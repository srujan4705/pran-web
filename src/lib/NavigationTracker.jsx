import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    // This can be used for analytics or tracking page views
    console.log('Navigation to:', location.pathname);
  }, [location]);

  return null;
}
