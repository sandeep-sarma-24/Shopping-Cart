import { useState, useEffect } from 'react';
import './cartSummary.css';
import { getCartItems } from '../../../services/api';

const CartSummary = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0); // State to hold total price
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await getCartItems();
      setCartItems(response.cartItems);
      setTotalPrice(response.totalPrice); // Set total price from response
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className='card-container'>
      <div className="cart-summary">
        <h2>Cart Summary</h2>
        {loading ? (
          <p>Loading cart items...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <>
            <div className="cart-items">
              <div className="cart-item_cart-header">
                <div className="cart-item-details">
                  <span>Name</span>
                  <span>Quantity</span>
                  <span>Item Price</span>
                  <span>Total Price</span>
                </div>
              </div>
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div className="cart-item" key={item.ID}>
                    <div className="cart-item-details">
                      <span>{item.Item.Name}</span>
                      <span>{item.Quantity}</span>
                      <span>${item.Item.Price}</span>
                      <span>${item.Item.Price * item.Quantity}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No items in the cart.</p>
              )}
            </div>
            <div className="total-price">Total Price: ${totalPrice.toFixed(2)}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartSummary;
