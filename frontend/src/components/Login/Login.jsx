import { useState } from 'react';
import { loginUser } from '../../services/api';
import './login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({ username, password });
      const token = response.token;
      if (token) {
        
        // Store the token in local storage
        localStorage.setItem('authToken', token);

        // Redirect to ItemList page upon successful login
        window.location.href = '/items';

      } else {
        setError('Invalid username or password');
        window.alert('Invalid username or password');
      }
    } catch (error) {
      setError('Invalid username or password');
      window.alert('Invalid username or password');
    }
  };

  return (
    <>
      <div className="background">
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
      <form onSubmit={handleSubmit} className="form">
        <h3>Login Here</h3>
        {error && <div className="error-message">{error}</div>}
        <label htmlFor="username">Username</label>
        <input 
          type="text" 
          placeholder="Email or Phone" 
          id="username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
        <label htmlFor="password">Password</label>
        <input 
          type="password" 
          placeholder="Password" 
          id="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Log In</button>
        <div className="social">
          <div className="go"><i className="fab fa-google"></i>  Google</div>
          <div className="fb"><i className="fab fa-facebook"></i>  Facebook</div>
        </div>
      </form>
    </>
  );
};

export default Login;
