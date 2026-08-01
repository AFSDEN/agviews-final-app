import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import '../styles/globals.css';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Verify token is valid
          const response = await fetch('/api/auth/verify', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setAuth({
              isAuthenticated: true,
              user: data.user,
              loading: false,
            });
          } else {
            localStorage.removeItem('auth_token');
            setAuth({
              isAuthenticated: false,
              user: null,
              loading: false,
            });
          }
        } else {
          setAuth({
            isAuthenticated: false,
            user: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuth({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
    };

    checkAuth();
  }, []);

  // Pass auth state to all pages
  const componentProps = {
    ...pageProps,
    auth,
  };

  return <Component {...componentProps} />;
}
