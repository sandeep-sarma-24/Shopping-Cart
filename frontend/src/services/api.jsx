const BASE_URL = 'http://localhost:8080'; // Update with your backend URL

// Function to handle common error scenarios
const handleErrors = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Something went wrong');
  }
  return response.json();
};

const storeAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Function to make GET request to users endpoint
export const getUsers = async () => {
  const response = await fetch(`${BASE_URL}/users`);
  return handleErrors(response);
};

// Function to make POST request to create user endpoint
export const createUser = async (user) => {
  const response = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  return handleErrors(response);
};

// Function to make POST request to login user endpoint
export const loginUser = async ({ username, password }) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const responseData = await handleErrors(response);
    const token = responseData.token;
    if (token) {
      storeAuthToken(token); // Store token in local storage
    }
    return responseData; // Return the response data
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Function to make GET request to items endpoint
export const getItems = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    console.log('Authentication token:', token); // Log the authentication token

    const response = await fetch(`${BASE_URL}/items`, {
      headers: {
        'Authorization': `${token}`, 
      },
    });

    return handleErrors(response);
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
};

// Function to make POST request to create item endpoint
export const createItem = async (item) => {
  const response = await fetch(`${BASE_URL}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  return handleErrors(response);
};

// Function to make GET request to carts endpoint
export const getCarts = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    console.log('Authentication token:', token); // Log the authentication token

    const response = await fetch(`${BASE_URL}/carts`, {
      headers: {
        'Authorization': `${token}`, 
      },
    });

    return handleErrors(response);
  } catch (error) {
    console.error('Error fetching carts:', error);
    throw error;
  }
};

// Function to make POST request to create cart endpoint
export const createCart = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    console.log('Creating cart...');

    const response = await fetch(`${BASE_URL}/carts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`, 
      },
    });

    return handleErrors(response);
  } catch (error) {
    console.error('Error creating cart:', error);
    throw error;
  }
};

// Function to make POST request to add item to cart endpoint
export const addToCart = async (itemId, quantity) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    console.log('Adding item to cart:', itemId, 'Quantity:', quantity);
    
    const response = await fetch(`${BASE_URL}/carts/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ itemId, quantity }), // Send both itemId and quantity in the request body
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error('Failed to add item to cart');
    }

    const responseData = await response.json();
    console.log('Item added to cart successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
};

// Update the function to get cart items
export const getCartItems = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    console.log('Authentication token:', token); // Log the authentication token

    const response = await fetch(`${BASE_URL}/cart/items`, {
      headers: {
        'Authorization': `${token}`, // Update to include 'Bearer' prefix
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart items');
    }

    return response.json(); // Parse response JSON
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};

// Function to make DELETE request to delete cart endpoint
export const deleteCart = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    console.log('Deleting cart...');

    const response = await fetch(`${BASE_URL}/carts`, {
      method: 'DELETE',
      headers: {
        'Authorization': `${token}`, 
      },
    });

    return handleErrors(response);
  } catch (error) {
    console.error('Error deleting cart:', error);
    throw error;
  }
};
