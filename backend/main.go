package main

import (
    "crypto/rand"
    "encoding/hex"
    "fmt"
    "log"
    "net/http"
    "time"

    "github.com/dgrijalva/jwt-go"
    "github.com/gin-gonic/gin"
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
)

var (
    db               *gorm.DB
    jwtSecret        = []byte("secret")
    cleanupFrequency = 24 * time.Hour // Token cleanup frequency
)

// Define GORM models
type User struct {
    gorm.Model
    Username string
    Password string
    Email    string
    Token    string `gorm:"uniqueIndex"`
}

type Item struct {
    gorm.Model
    Name  string
    Price int
    Status string
}

type Cart struct {
    gorm.Model
    UserID uint
    Name   string
    Status string
    CartID    uint
    ItemID    uint
    Items  []*Item `gorm:"many2many:cart_items;"`
}

type CartItem struct {
    gorm.Model
    CartID uint
    ItemID uint
    Quantity int
    Item     Item `gorm:"foreignKey:ItemID"`
    CreatedAt time.Time
    DeletedAt *time.Time `gorm:"index"`
}

type Order struct {
    gorm.Model
    UserID uint
    Items  []*Item `gorm:"many2many:order_items;"`
    Total  int
    Date   time.Time
}

func main() {
    // Open a connection to the SQLite database using GORM
    var err error
    db, err = gorm.Open(sqlite.Open("mydatabase.db"), &gorm.Config{})
    if err != nil {
        panic("failed to connect database")
    }

    // Auto-migrate the database
    err = db.AutoMigrate(&User{}, &Item{}, &Cart{}, &CartItem{}, &Order{})
    if err != nil {
        panic("failed to migrate database")
    }

    // Start the token cleanup task
    go tokenCleanup()

    // Create Gin router
    r := gin.Default()

    // CORS middleware
    r.Use(func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(http.StatusNoContent)
            return
        }
        c.Next()
    })

    // Define API routes
    r.POST("/signup", createUser)
    r.POST("/login", loginUser)

    // Routes requiring authorization
    authorized := r.Group("/")
    authorized.Use(authMiddleware())
    {
        authorized.POST("/items", createItem)
        authorized.GET("/items", listItems)
        authorized.POST("/carts", createCart)
        authorized.GET("/carts", listCarts)
        authorized.POST("/orders", createOrder)
        authorized.GET("/orders", listOrders)
        authorized.POST("/carts/items", addToCart)
        authorized.GET("/cart/items", listCartItems)
    }

    // Run the server
    r.Run(":8080")
}

func createUser(c *gin.Context) {
    var newUser User
    if err := c.BindJSON(&newUser); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Check if username already exists
    var existingUser User
    if err := db.Where("username = ?", newUser.Username).First(&existingUser).Error; err == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
        return
    }

    // Check if email already exists
    if err := db.Where("email = ?", newUser.Email).First(&existingUser).Error; err == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
        return
    }

    // Generate unique alphanumeric ID for the user
    newUser.Token = generateUniqueToken()

    // Create user in the database
    if err := db.Create(&newUser).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
        return
    }

    newCart := Cart{UserID: newUser.ID}
    if err := db.Create(&newCart).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cart"})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"id": newUser.ID, "username": newUser.Username, "token": newUser.Token})
}

func generateUniqueToken() string {
    // Generate a random token
    randomBytes := make([]byte, 16)
    if _, err := rand.Read(randomBytes); err != nil {
        // Fallback to timestamp if random generation fails
        return fmt.Sprintf("%d", time.Now().UnixNano())
    }
    return hex.EncodeToString(randomBytes)
}

func loginUser(c *gin.Context) {
    var loginUser User
    if err := c.BindJSON(&loginUser); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Log the username and password for debugging
    log.Printf("Attempting login with username: %s, password: %s\n", loginUser.Username, loginUser.Password)

    var user User
    if err := db.Where("username = ? AND password = ?", loginUser.Username, loginUser.Password).First(&user).Error; err != nil {
        // Log the error for debugging
        log.Printf("Login failed for username: %s\n", loginUser.Username)

        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
        return
    }

    // Generate JWT token
    token, err := generateToken(user.Username) // Use user.Username here
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
        return
    }

    // Store token in the database
    user.Token = token
    if err := db.Save(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store token"})
        return
    }

    // Check if the user already has a cart
    var existingCart Cart
    if err := db.Where("user_id = ?", user.ID).First(&existingCart).Error; err != nil {
        // If the user doesn't have a cart, create one
        newCart := Cart{UserID: user.ID}
        if err := db.Create(&newCart).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cart"})
            return
        }
    }

    c.JSON(http.StatusOK, gin.H{"token": token})
}

func authMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        tokenString := c.GetHeader("Authorization")
        if tokenString == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token is required"})
            c.Abort()
            return
        }

        claims := jwt.MapClaims{}
        token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
            return jwtSecret, nil
        })

        if err != nil || !token.Valid {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }

        // Log the parsed token
        fmt.Printf("Parsed token: %v\n", token)

        // Check if the user exists in the database
        var user User
        if err := db.Where("token = ?", tokenString).First(&user).Error; err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
            c.Abort()
            return
        }

        // Attach the user object to the context for downstream handlers
        c.Set("user", user)

        // Continue with the next middleware/handler
        c.Next()
    }
}

func generateToken(username string) (string, error) {
    token := jwt.New(jwt.SigningMethodHS256)
    claims := token.Claims.(jwt.MapClaims)
    claims["username"] = username
    claims["exp"] = time.Now().Add(time.Hour).Unix() // Token expiration time

    tokenString, err := token.SignedString(jwtSecret)
    if err != nil {
        return "", err
    }

    // Log the generated token
    fmt.Printf("Generated token for user %s: %s\n", username, tokenString)

    return tokenString, nil
}

func tokenCleanup() {
    for {
        time.Sleep(cleanupFrequency)

        // Delete expired tokens from the database
        err := db.Where("expires_at < ?", time.Now()).Delete(&User{}).Error
        if err != nil {
            log.Printf("Error cleaning up expired tokens: %v\n", err)
        }
    }
}

func createItem(c *gin.Context) {
    var newItem Item
    if err := c.BindJSON(&newItem); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Create item in the database
    if err := db.Create(&newItem).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create item"})
        return
    }

    c.JSON(http.StatusCreated, newItem)
}

func listItems(c *gin.Context) {
    var items []Item
    if err := db.Find(&items).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list items"})
        return
    }

    c.JSON(http.StatusOK, items)
}

func createCart(c *gin.Context) {
    userToken := c.Request.Header.Get("Authorization")
    var user User
    if err := db.Where("token = ?", userToken).First(&user).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    var existingCart Cart
    if err := db.Where("user_id = ?", user.ID).First(&existingCart).Error; err == nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "User already has a cart"})
        return
    }

    newCart := Cart{UserID: user.ID}
    if err := db.Create(&newCart).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cart"})
        return
    }

    c.JSON(http.StatusCreated, newCart)
}

func createOrder(c *gin.Context) {
    userToken := c.Request.Header.Get("Authorization")
    var user User
    if err := db.Where("token = ?", userToken).First(&user).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    var cart Cart
    if err := db.Where("user_id = ?", user.ID).First(&cart).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "User does not have a cart"})
        return
    }

    // Calculate total price
    var total int
    for _, item := range cart.Items {
        total += item.Price
    }

    order := Order{
        UserID: user.ID,
        Items:  cart.Items,
        Total:  total,
        Date:   time.Now(),
    }

    // Clear cart
    if err := db.Delete(&cart).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
        return
    }

    if err := db.Create(&order).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
        return
    }

    c.JSON(http.StatusCreated, order)
}

func listCarts(c *gin.Context) {
    var carts []Cart
    if err := db.Find(&carts).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list carts"})
        return
    }

    c.JSON(http.StatusOK, carts)
}

func addToCart(c *gin.Context) {
    userToken := c.Request.Header.Get("Authorization")
    var user User
    if err := db.Where("token = ?", userToken).First(&user).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    var cart Cart
    if err := db.Where("user_id = ?", user.ID).First(&cart).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "User does not have a cart"})
        return
    }

    // Parse item ID and quantity from request body
    var request struct {
        ItemID   uint `json:"itemId"`
        Quantity int  `json:"quantity"`
    }
    if err := c.BindJSON(&request); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }

    // Check if the item exists
    var item Item
    if err := db.First(&item, request.ItemID).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Item not found"})
        return
    }

    // Check if the item already exists in the cart
    var existingCartItem CartItem
    if err := db.Where("cart_id = ? AND item_id = ?", cart.ID, item.ID).First(&existingCartItem).Error; err == nil {
        // If the item already exists in the cart, update its quantity
        existingCartItem.Quantity += request.Quantity
        if err := db.Save(&existingCartItem).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update item in cart"})
            return
        }
    } else {
        // If the item is not in the cart, create a new entry
        newCartItem := CartItem{
            CartID:   cart.ID,
            ItemID:   item.ID,
            Quantity: request.Quantity,
        }
        if err := db.Create(&newCartItem).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add item to cart"})
            return
        }
    }

    c.JSON(http.StatusOK, gin.H{"message": "Item added to cart successfully"})
}


func listOrders(c *gin.Context) {
    var orders []Order
    if err := db.Find(&orders).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list orders"})
        return
    }

    c.JSON(http.StatusOK, orders)
}

func listCartItems(c *gin.Context) {
    userToken := c.Request.Header.Get("Authorization")
    var user User
    if err := db.Where("token = ?", userToken).First(&user).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    var cart Cart
    if err := db.Where("user_id = ?", user.ID).First(&cart).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "User does not have a cart"})
        return
    }

    // Fetch cart items with associated items
    var cartItems []CartItem
    if err := db.Preload("Item").Where("cart_id = ?", cart.ID).Find(&cartItems).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart items"})
        return
    }

    // Calculate total price of all items in the cart
    totalPrice := 0.0 // Initialize total price as float64
    for _, cartItem := range cartItems {
        itemPrice := float64(cartItem.Item.Price) // Convert item price to float64
        totalPrice += itemPrice * float64(cartItem.Quantity) // Multiply by quantity and add to total
    }

    // Construct response object
    response := gin.H{
        "cartItems":  cartItems,
        "totalPrice": totalPrice,
    }

    c.JSON(http.StatusOK, response)
}
