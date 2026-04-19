import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { api, apiClient, setAuthToken } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef(null);
  const didRestoreRef = useRef(false);

  function clearSession(redirectTo = '/login') {
    tokenRef.current = null;
    setUser(null);
    setToken(null);
    localStorage.removeItem('wault_token');
    setAuthToken(null);

    if (redirectTo) {
      navigate(redirectTo, { replace: true });
    }
  }

  useEffect(() => {
    tokenRef.current = token;
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use((config) => {
      if (tokenRef.current) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${tokenRef.current}`;
      }

      return config;
    });

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && tokenRef.current) {
          clearSession('/login');
        }

        return Promise.reject(error);
      },
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    if (didRestoreRef.current) {
      return;
    }

    didRestoreRef.current = true;
    const storedToken = localStorage.getItem('wault_token');

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    setAuthToken(storedToken);

    api.auth
      .me()
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        clearSession(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!user || !token) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      api.activity.ping().catch(() => {});
    }, 5 * 60 * 1000);

    return () => window.clearInterval(interval);
  }, [user, token]);

  async function login(email, password) {
    const data = await api.auth.login(email, password);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('wault_token', data.token);
    navigate('/', { replace: true });
    return data;
  }

  async function register(name, email, password) {
    const data = await api.auth.register(name, email, password);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('wault_token', data.token);
    navigate('/', { replace: true });
    return data;
  }

  function logout() {
    clearSession('/login');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
