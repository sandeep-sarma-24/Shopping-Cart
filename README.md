
# Online Shopping Application

This is an online shopping application built using React.js for the frontend and Golang for the backend. It allows users to browse through a list of items, add them to their cart, and proceed to checkout.

## Features

- **Browse Items:** Users can view a list of available items with details such as name, price, and status.
- **Add to Cart:** Users can add items to their cart by specifying the quantity.
- **View Cart Summary:** Users can view a summary of items in their cart, including the quantity, price, and total amount.
- **Checkout:** Users can proceed to checkout and complete their purchase.

## Technologies Used

- **Frontend:** React.js, Material-UI
- **Backend:** Golang (with Gin framework), GORM (Object-Relational Mapping)
- **Database:** SQLite
- **Authentication:** JWT (JSON Web Tokens) for user authentication
- **API:** RESTful API for communication between frontend and backend
- **Styling:** CSS

## Getting Started

1. **Clone the repository:**
   ```
   git clone https://github.com/your-username/online-shopping-app.git
   ```

2. **Install dependencies:**
   ```
   cd online-shopping-app
   go mod tidy
   ```

3. **Start the backend server:**
   ```
   go run main.go
   ```

4. **Start the frontend server:**
   ```
   cd client
   npm install
   npm start
   ```

5. **Access the application:**
   Open your web browser and navigate to `http://localhost:3000` to access the online shopping application.

## Folder Structure

```
online-shopping-app/
│
├── client/                 # Frontend React application
│   ├── public/             # Public assets and HTML template
│   └── src/                # Source code
│       ├── components/     # React components
│       ├── services/       # API service functions
│       ├── styles/         # CSS stylesheets
│       └── App.js          # Main application component
│
├── server/                 # Backend Golang application
│   ├── main.go             # Main server file
│
└── README.md               # Project README
```

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
