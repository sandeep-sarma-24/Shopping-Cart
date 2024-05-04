import { useState, useEffect } from 'react';
import './cartSummary.css';
import { getCartItems, deleteCartItem } from '../../../services/api';
import CartDeleteButton from '../Cart_Delete/CartDeleteButton';

const CartSummary = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await getCartItems();
      setCartItems(response.cartItems);
      setTotalPrice(response.totalPrice);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteCartItem(itemId);
      // Refetch cart items after deletion
      fetchCartItems();
    } catch (error) {
      console.error('Error deleting cart item:', error);
      setError(error.message);
    }
  };

// make a change

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
                  <span>Action</span> {/* Add Action column */}
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
                      <button onClick={() => handleDeleteItem(item.Item.ID)}>-</button> {/* Delete button */}
                    </div>
                  </div>
                ))
              ) : (
                <p>No items in the cart.</p>
              )}
            </div>
            <div className="total-price">Total Price: ${totalPrice.toFixed(2)}</div>
            <div>
              <CartDeleteButton fetchCartItems={fetchCartItems} setError={setError} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartSummary;
