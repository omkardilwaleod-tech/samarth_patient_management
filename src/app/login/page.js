"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [userName, setUserName] = useState(''); // Changed to userName
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in
    const role = localStorage.getItem('userRole');
    if (role) {
      router.push(`/${role}`);
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName, password }), // Use userName
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('userRole', data.role);
        router.push(`/${data.role}`);
      } else {
        setMessage(data.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="card-title text-center mb-4">Login</h2>
        {message && (
          <div className={`alert ${message.includes('failed') || message.includes('error') ? 'alert-danger' : 'alert-success'} mb-3`} role="alert">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="usernameInput" className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="usernameInput"
              value={userName} // Use userName
              onChange={(e) => setUserName(e.target.value)} // Use setUserName
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="passwordInput" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="passwordInput"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  );
}