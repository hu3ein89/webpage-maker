import { useState } from 'react';
import '../css/Login.css'; // 👈 Make sure to import the CSS file

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Fake successful login (for testing only)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      credentials.username === 'admin' &&
      credentials.password === 'admin123'
    ) {
      localStorage.setItem('authToken', 'fake-token');
      onLogin();
    } else {
      setFailedAttempts(prev => prev + 1);
    }
  };


  return (
    <div className='loginForm-container'>
      <div className="login-wrapper">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Admin Login</h2>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
          </div>
          <button type="submit">Login</button>
          {failedAttempts > 0 && (
            <p className="attempts-warning">
              Failed attempts: {failedAttempts} (Max 3)
            </p>
          )}
        </form>
      </div>

    </div>
  );
};

export default Login;
