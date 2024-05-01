import { useState, useEffect } from 'react';
import { getUsers } from '../../services/api';
import './userlist.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response); // Assuming response is an array
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again later.');
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container">
      <table className="table">
        <thead>
          <tr className="table-header">
            <th>Username</th>
            <th>Password</th>
            <th>Token</th>
          </tr>
        </thead>
        <tbody>
          {users && users.length > 0 && users.map(user => (
            <tr className="table-row" key={user.ID}>
              <td className="table-data">{user.Username}</td>
              <td className="table-data">{user.Password}</td>
              <td className="table-data">{user.Token}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
