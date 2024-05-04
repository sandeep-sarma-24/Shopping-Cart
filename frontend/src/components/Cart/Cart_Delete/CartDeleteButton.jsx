import { useState } from 'react';
import { deleteCart } from '../../../services/api';
import './CartDeleteButton.css'; // Import the CSS file for the button styling

const CartDeleteButton = ({ fetchCartItems, setError }) => {
  const [loading, setLoading] = useState(false);

  const handleDeleteCart = async () => {
    try {
      setLoading(true);
      await deleteCart();
      setLoading(false);
      // Optionally, you can perform any additional actions after cart deletion, such as refreshing the page or updating state.
      fetchCartItems(); // Fetch cart items after deletion
    } catch (error) {
      console.error('Error deleting cart:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  

  return (
    <div className='button-container'>
      <button className="delete-button" onClick={handleDeleteCart} disabled={loading}>
        {loading ? 'Deleting...' : 'Delete Cart'}
      </button>
    </div>
  );
};

export default CartDeleteButton;
