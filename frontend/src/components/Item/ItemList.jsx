// ItemList.jsx
import { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { getItems, addToCart } from '../../services/api';
import './itemList.css'; // Import CSS file
import CartSummary from '../Cart/CartSummary'; // Import CartSummary component

const ItemList = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [cartEmpty, setCartEmpty] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await getItems();
      setItems(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = async (itemId) => {
    try {
      const quantityInput = document.getElementById(`quantity-${itemId}`);
      const quantity = parseInt(quantityInput.value);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error('Please enter a valid quantity');
      }
      await addToCart(itemId, quantity);
      console.log('Item added to cart successfully');
      setCartEmpty(false);
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  const handleCheckout = () => {
    console.log('Checkout Now clicked');
    // Add logic for handling checkout here
  };

  return (
      <div>
        <div className='card-container'> {/* Add .card-container class here */}
          {loading ? (
            <CircularProgress />
          ) : (
            <div>
              <ul className="mystyle-products">
                {items.map((item) => (
                  <li className="product" key={item.ID}>
                    <div>Name: {item.Name}</div>
                    <div>Price: ${item.Price}</div>
                    <div>Status: {item.Status}</div>
                    <div className="quantity-container">
                      <label htmlFor={`quantity-${item.ID}`}>Quantity:</label>
                      <button
                        className="quantity-btn"
                        onClick={() => {
                          const input = document.getElementById(`quantity-${item.ID}`);
                          if (input) {
                            input.stepDown();
                          }
                        }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        id={`quantity-${item.ID}`}
                        defaultValue="0"
                        min="0"
                      />
                      <button
                        className="quantity-btn"
                        onClick={() => {
                          const input = document.getElementById(`quantity-${item.ID}`);
                          if (input) {
                            input.stepUp();
                          }
                        }}
                      >
                        +
                      </button>
                    </div>
                    <button onClick={() => handleAddToCart(item.ID)}>Add to Cart</button>
                  </li>
                ))}
              </ul>
              {!cartEmpty && <button onClick={handleCheckout}>Checkout Now</button>}
            </div>
          )}
        </div>
        <CartSummary />
      </div>
  );
};

export default ItemList;
