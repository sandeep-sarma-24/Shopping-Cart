import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserList from './components/User/UserList';
import ItemList from './components/Item/ItemList';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup'


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/users" element={<UserList />} />
        <Route path="/items" element={<ItemList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<Signup />} />

        {/* Add routes for other components */}
      </Routes>
    </Router>
  );
};

export default App;
