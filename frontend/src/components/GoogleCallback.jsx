import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const name = searchParams.get('name');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Google authentication failed');
      navigate('/auth');
      return;
    }

    if (token && role) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userName', name || 'User');
      
      toast.success('Login successful with Google!');
      navigate('/');
    } else {
      toast.error('Authentication failed');
      navigate('/auth');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      Completing Google Sign In...
    </div>
  );
};

export default GoogleCallback;
