import { useState } from 'react';
import { createUser } from '../../services/api';
import './signup.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const onSignup = (token) => {
    // Placeholder function for handling successful signup
    console.log('Signed up');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createUser({ username, email, password });
      const token = response.token;
      if (token) {
        onSignup(token);
        setSuccess(true);
      } else {
        setError('Error signing up');
      }
    } catch (error) {
      setError('Error signing up');
    }
  };

  return (
    <>
      <div className="background">
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
      <form onSubmit={handleSubmit} className="form">
        <h3>Sign Up</h3>
        {error && <div className="error-message">{error}</div>}
        <label htmlFor="username">Username</label>
        <input 
          type="text" 
          placeholder="Username" 
          id="username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
        <label htmlFor="email">Email</label>
        <input 
          type="email" 
          placeholder="Email" 
          id="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
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
        <div className="button-container">
          <button type="submit">Sign Up</button>
        </div>

      </form>
    </>
  );
};

export default Signup;
