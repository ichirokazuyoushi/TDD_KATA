# 🍬 Complete Guide: Sweet Shop Application
## Explained Like You Just Started React

---

## 📚 Table of Contents
1. [React Basics - What You Need to Know](#react-basics)
2. [Application Structure](#application-structure)
3. [How Data Flows (Frontend → Backend → Database)](#data-flow)
4. [Authentication Flow (Login/Register)](#authentication-flow)
5. [Dashboard & Sweets Management](#dashboard-flow)
6. [Complete Function Reference](#function-reference)

---

## 🎯 React Basics - What You Need to Know

### What is React?
React is a JavaScript library for building user interfaces. Think of it like building blocks:
- **Components** = Reusable building blocks (like LEGO pieces)
- **Props** = Data you pass TO a component (like giving instructions)
- **State** = Data that can CHANGE inside a component (like a variable that updates)
- **Hooks** = Special functions that let components "hook into" React features

### Key React Concepts Used Here:

#### 1. **useState** - Storing Data That Changes
```javascript
const [email, setEmail] = useState('');
```
- `email` = current value (starts as empty string '')
- `setEmail` = function to update the value
- When user types, we call `setEmail(newValue)` to update it

#### 2. **useEffect** - Running Code When Component Loads
```javascript
useEffect(() => {
  loadSweets();
}, []);
```
- Runs code when component first appears
- Empty `[]` means "run once when component loads"
- Used to fetch data from the server

#### 3. **Context** - Sharing Data Between Components
- Like a global storage box
- Any component can access data from Context
- We use `AuthContext` to share user info everywhere

#### 4. **Props** - Passing Data to Components
```javascript
<SweetCard sweet={sweetData} onPurchase={handlePurchase} />
```
- `sweet` = data passed TO SweetCard
- `onPurchase` = function passed TO SweetCard
- SweetCard can use these but can't change them directly

---

## 🏗️ Application Structure

### Frontend (React) - What Users See
```
frontend/
├── src/
│   ├── App.tsx              # Main app, handles routing
│   ├── context/
│   │   └── AuthContext.tsx  # Stores user login info globally
│   ├── pages/
│   │   ├── Login.tsx        # Login page
│   │   ├── Register.tsx    # Registration page
│   │   └── Dashboard.tsx   # Main page with sweets
│   ├── components/
│   │   ├── SweetCard.tsx    # Shows one sweet item
│   │   ├── SearchBar.tsx    # Search/filter sweets
│   │   └── [Modals]        # Popups for add/edit/restock
│   └── services/
│       └── api.ts          # Functions to talk to backend
```

### Backend (Node.js/Express) - Server That Handles Requests
```
backend/
├── src/
│   ├── server.ts           # Starts the server
│   ├── routes/
│   │   ├── auth.ts        # Login/register routes
│   │   └── sweets.ts      # Sweet management routes
│   ├── controllers/
│   │   ├── authController.ts  # Login/register logic
│   │   └── sweetController.ts # Sweet CRUD logic
│   ├── middleware/
│   │   └── auth.ts        # Checks if user is logged in
│   └── models/
│       ├── User.ts        # User database structure
│       └── Sweet.ts       # Sweet database structure
```

---

## 🔄 How Data Flows (Frontend → Backend → Database)

### The Journey of a Request:

1. **User clicks button** (Frontend)
   ```
   User clicks "Purchase" → handlePurchase() called
   ```

2. **Frontend makes API call** (Frontend → Backend)
   ```javascript
   sweetsAPI.purchase(sweetId, quantity)
   → Sends HTTP POST request to backend
   → Includes authentication token in header
   ```

3. **Backend receives request** (Backend)
   ```
   Route: POST /api/sweets/:id/purchase
   → Middleware checks authentication
   → Controller function runs
   ```

4. **Backend talks to database** (Backend → MongoDB)
   ```
   Controller finds sweet in database
   → Updates quantity
   → Saves changes
   ```

5. **Response sent back** (Backend → Frontend)
   ```
   Backend sends JSON response
   → Frontend receives updated sweet data
   → React updates the UI
   ```

---

## 🔐 Authentication Flow (Login/Register)

### REGISTRATION FLOW (Step by Step)

#### Step 1: User Fills Form (`Register.tsx`)
```javascript
// User types in form fields
const [username, setUsername] = useState('');  // Stores username
const [email, setEmail] = useState('');        // Stores email
const [password, setPassword] = useState('');  // Stores password
```

**What happens:**
- User types → `onChange` event fires
- `setUsername(e.target.value)` updates state
- React re-renders with new value

#### Step 2: User Submits Form
```javascript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();  // Stops page from refreshing
  await register(username, email, password);  // Calls AuthContext function
  navigate('/dashboard');  // Redirects to dashboard
};
```

**What happens:**
- `e.preventDefault()` = stops form from submitting normally
- Calls `register()` from AuthContext
- If successful, navigates to dashboard

#### Step 3: AuthContext Processes Registration (`AuthContext.tsx`)
```javascript
const register = async (username, email, password) => {
  // Calls API function
  const response = await authAPI.register({ username, email, password });
  
  // Saves token and user info
  setToken(response.token);
  setUser(response.user);
  localStorage.setItem('token', response.token);  // Saves to browser storage
  localStorage.setItem('user', JSON.stringify(response.user));
};
```

**What happens:**
- Calls `authAPI.register()` which sends HTTP request
- Backend responds with token and user data
- Saves token to localStorage (so user stays logged in)
- Updates React state so all components know user is logged in

#### Step 4: API Call (`api.ts`)
```javascript
export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }
};
```

**What happens:**
- `api.post()` = sends POST request to `http://localhost:3000/api/auth/register`
- Sends `{ username, email, password }` as JSON
- Waits for response
- Returns the response data

#### Step 5: Backend Receives Request (`server.ts` → `routes/auth.ts`)
```javascript
// server.ts sets up route
app.use('/api/auth', authRoutes);

// routes/auth.ts defines endpoint
router.post('/register', registerValidation, register);
```

**What happens:**
- Express receives POST request at `/api/auth/register`
- Runs validation middleware (checks if fields are valid)
- Calls `register` controller function

#### Step 6: Backend Controller (`authController.ts`)
```javascript
export const register = async (req: Request, res: Response) => {
  // 1. Get data from request
  const { username, email, password } = req.body;
  
  // 2. Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  // 3. Hash password (encrypt it)
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // 4. Create new user in database
  const user = new User({
    username,
    email,
    password: hashedPassword,  // Save hashed version, not plain text!
  });
  await user.save();
  
  // 5. Generate JWT token (like a temporary ID card)
  const token = generateToken(user._id.toString());
  
  // 6. Send response back
  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,  // Defaults to 'user'
    },
  });
};
```

**What happens step by step:**
1. Extracts username, email, password from request body
2. Checks database if user with same email/username exists
3. If exists → returns error
4. If not → hashes password (turns "password123" into encrypted string)
5. Creates new User document in MongoDB
6. Generates JWT token (like a temporary ID card that proves who you are)
7. Sends back token and user info (without password!)

---

### LOGIN FLOW (Similar but Different)

#### Step 1: User Fills Login Form (`Login.tsx`)
```javascript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
```

#### Step 2: User Submits
```javascript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await login(email, password);  // From AuthContext
  navigate('/dashboard');
};
```

#### Step 3: AuthContext Processes (`AuthContext.tsx`)
```javascript
const login = async (email: string, password: string) => {
  const response = await authAPI.login({ email, password });
  setToken(response.token);
  setUser(response.user);
  localStorage.setItem('token', response.token);
  localStorage.setItem('user', JSON.stringify(response.user));
};
```

#### Step 4: Backend Controller (`authController.ts`)
```javascript
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // 1. Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // 2. Compare password (hashed vs plain text)
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // 3. Generate token
  const token = generateToken(user._id.toString());
  
  // 4. Send response
  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
};
```

**Key Difference:**
- Registration: Creates new user
- Login: Finds existing user and verifies password

---

## 📊 Dashboard & Sweets Management Flow

### How Dashboard Loads Sweets

#### Step 1: Component Mounts (`Dashboard.tsx`)
```javascript
useEffect(() => {
  loadSweets();  // Runs when component first loads
}, []);
```

#### Step 2: Load Sweets Function
```javascript
const loadSweets = async () => {
  try {
    setLoading(true);  // Show loading spinner
    const data = await sweetsAPI.getAll();  // Fetch from backend
    setSweets(data);  // Store in state
    setFilteredSweets(data);  // Also store filtered version
  } catch (err) {
    setError('Failed to load sweets');  // Show error if fails
  } finally {
    setLoading(false);  // Hide loading spinner
  }
};
```

#### Step 3: API Call (`api.ts`)
```javascript
export const sweetsAPI = {
  getAll: async (): Promise<Sweet[]> => {
    const response = await api.get<{ sweets: Sweet[] }>('/sweets');
    return response.data.sweets;
  }
};
```

**What happens:**
- Sends GET request to `/api/sweets`
- Includes authentication token in header (from localStorage)
- Backend checks token → verifies user is logged in
- Returns array of sweets

#### Step 4: Backend Route (`routes/sweets.ts`)
```javascript
router.use(authenticate);  // All routes require login
router.get('/', getAllSweets);  // GET /api/sweets
```

**What happens:**
- `authenticate` middleware runs first
- Checks if token is valid
- If valid → adds user info to `req.user`
- Then calls `getAllSweets` controller

#### Step 5: Backend Controller (`sweetController.ts`)
```javascript
export const getAllSweets = async (req: AuthRequest, res: Response) => {
  try {
    // Find all sweets, sort by newest first
    const sweets = await Sweet.find().sort({ createdAt: -1 });
    res.json({ sweets });  // Send back as JSON
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sweets' });
  }
};
```

**What happens:**
- Queries MongoDB for all Sweet documents
- Sorts by `createdAt` descending (newest first)
- Sends back as JSON: `{ sweets: [...] }`

#### Step 6: Display in UI
```javascript
{filteredSweets.map((sweet) => (
  <SweetCard
    key={sweet._id}
    sweet={sweet}
    onPurchase={handlePurchase}
    onEdit={isAdmin ? () => setEditingSweet(sweet) : undefined}
    // ... more props
  />
))}
```

**What happens:**
- Maps over array of sweets
- Creates one `SweetCard` component for each sweet
- Passes sweet data and functions as props

---

### PURCHASE FLOW (When User Buys a Sweet)

#### Step 1: User Clicks "Purchase" Button (`SweetCard.tsx`)
```javascript
<button onClick={() => onPurchase(sweet._id, 1)}>
  Purchase
</button>
```

**What happens:**
- `onPurchase` is a function passed from Dashboard
- Calls it with sweet ID and quantity (1)

#### Step 2: Dashboard Handles Purchase (`Dashboard.tsx`)
```javascript
const handlePurchase = async (sweetId: string, quantity: number = 1) => {
  try {
    await sweetsAPI.purchase(sweetId, quantity);  // Call API
    await loadSweets();  // Refresh the list
  } catch (err) {
    setError('Purchase failed');
  }
};
```

**What happens:**
- Calls API to purchase
- If successful, reloads sweets (to show updated quantity)
- If error, shows error message

#### Step 3: API Call (`api.ts`)
```javascript
purchase: async (id: string, quantity: number = 1): Promise<Sweet> => {
  const response = await api.post(`/sweets/${id}/purchase`, { quantity });
  return response.data.sweet;
}
```

**What happens:**
- POST request to `/api/sweets/123/purchase`
- Sends `{ quantity: 1 }` in body

#### Step 4: Backend Route (`routes/sweets.ts`)
```javascript
router.post('/:id/purchase', purchaseSweet);
```

#### Step 5: Backend Controller (`sweetController.ts`)
```javascript
export const purchaseSweet = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;  // Sweet ID from URL
  const { quantity: purchaseQuantity = 1 } = req.body;  // Quantity from body
  
  // 1. Find the sweet
  const sweet = await Sweet.findById(id);
  if (!sweet) {
    return res.status(404).json({ error: 'Sweet not found' });
  }
  
  // 2. Check if enough in stock
  if (sweet.quantity < purchaseQuantity) {
    return res.status(400).json({ error: 'Insufficient quantity in stock' });
  }
  
  // 3. Subtract quantity
  sweet.quantity -= purchaseQuantity;
  await sweet.save();  // Save to database
  
  // 4. Send updated sweet back
  res.json({
    message: 'Purchase successful',
    sweet,
  });
};
```

**What happens:**
1. Gets sweet ID from URL parameter
2. Gets quantity from request body
3. Finds sweet in database
4. Checks if enough stock
5. Subtracts quantity
6. Saves to database
7. Returns updated sweet

---

### ADD SWEET FLOW (Admin Only)

#### Step 1: Admin Clicks "Add New Sweet" (`Dashboard.tsx`)
```javascript
{isAdmin && (
  <button onClick={() => setShowAddModal(true)}>
    + Add New Sweet
  </button>
)}
```

**What happens:**
- Only shows if `isAdmin` is true
- Sets `showAddModal` state to true
- Modal component appears

#### Step 2: User Fills Form in Modal (`AddSweetModal.tsx`)
- User enters: name, category, price, quantity
- Clicks "Add"

#### Step 3: Dashboard Handles Add (`Dashboard.tsx`)
```javascript
const handleAddSweet = async (sweetData: {
  name: string;
  category: string;
  price: number;
  quantity: number;
}) => {
  try {
    await sweetsAPI.create(sweetData);
    setShowAddModal(false);  // Close modal
    await loadSweets();  // Refresh list
  } catch (err) {
    setError('Failed to add sweet');
  }
};
```

#### Step 4: API Call (`api.ts`)
```javascript
create: async (data: SweetData): Promise<Sweet> => {
  const response = await api.post('/sweets', data);
  return response.data.sweet;
}
```

#### Step 5: Backend Route (`routes/sweets.ts`)
```javascript
router.post('/', requireAdmin, sweetValidation, createSweet);
```

**What happens:**
- `requireAdmin` middleware checks if user role is 'admin'
- If not admin → returns 403 error
- If admin → runs validation → calls controller

#### Step 6: Backend Controller (`sweetController.ts`)
```javascript
export const createSweet = async (req: AuthRequest, res: Response) => {
  const { name, category, price, quantity } = req.body;
  
  const sweet = new Sweet({
    name,
    category,
    price,
    quantity: quantity || 0,
  });
  
  await sweet.save();  // Save to database
  
  res.status(201).json({
    message: 'Sweet created successfully',
    sweet,
  });
};
```

---

### SEARCH FLOW

#### Step 1: User Enters Search Criteria (`SearchBar.tsx`)
```javascript
const [name, setName] = useState('');
const [category, setCategory] = useState('');
const [minPrice, setMinPrice] = useState('');
const [maxPrice, setMaxPrice] = useState('');
```

#### Step 2: User Submits Search
```javascript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  onSearch({
    name: name || undefined,
    category: category || undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
  });
};
```

**What happens:**
- Collects all search fields
- Converts empty strings to `undefined`
- Converts price strings to numbers
- Calls `onSearch` function (passed from Dashboard)

#### Step 3: Dashboard Handles Search (`Dashboard.tsx`)
```javascript
const handleSearch = async (filters: {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) => {
  try {
    if (Object.keys(filters).length === 0) {
      setFilteredSweets(sweets);  // Show all if no filters
      return;
    }
    
    const results = await sweetsAPI.search(filters);
    setFilteredSweets(results);  // Update filtered list
  } catch (err) {
    setError('Search failed');
  }
};
```

#### Step 4: API Call (`api.ts`)
```javascript
search: async (params: {...}): Promise<Sweet[]> => {
  const response = await api.get('/sweets/search', { params });
  return response.data.sweets;
}
```

**What happens:**
- GET request to `/sweets/search?name=chocolate&category=candy&minPrice=1&maxPrice=10`
- Query parameters in URL

#### Step 5: Backend Controller (`sweetController.ts`)
```javascript
export const searchSweets = async (req: AuthRequest, res: Response) => {
  const { name, category, minPrice, maxPrice } = req.query;
  
  const query: any = {};
  
  // Build search query
  if (name) {
    query.name = { $regex: name, $options: 'i' };  // Case-insensitive search
  }
  if (category) {
    query.category = { $regex: category, $options: 'i' };
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);  // Greater than or equal
    if (maxPrice) query.price.$lte = Number(maxPrice);  // Less than or equal
  }
  
  const sweets = await Sweet.find(query).sort({ createdAt: -1 });
  res.json({ sweets });
};
```

**What happens:**
- Builds MongoDB query object
- `$regex` = pattern matching (finds "choc" in "chocolate")
- `$options: 'i'` = case-insensitive
- `$gte` = greater than or equal
- `$lte` = less than or equal
- Finds all sweets matching criteria

---

## 🔒 Authentication Middleware (How It Works)

### What is Middleware?
Middleware = code that runs BEFORE the main function. Like a security guard checking your ID before you enter.

### Authentication Flow (`middleware/auth.ts`)

```javascript
export const authenticate = async (req, res, next) => {
  // 1. Get token from header
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // 2. Verify token (check if it's valid)
  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
  
  // 3. Find user in database
  const user = await User.findById(decoded.userId).select('-password');
  
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  
  // 4. Attach user to request
  req.user = user;
  
  // 5. Continue to next function
  next();
};
```

**What happens:**
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token using secret key
3. Gets user ID from token
4. Finds user in database
5. Attaches user to `req.user` so controller can use it
6. Calls `next()` to continue to controller

### Admin Check (`middleware/auth.ts`)
```javascript
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};
```

**What happens:**
- Checks if user exists (from authenticate middleware)
- Checks if user role is 'admin'
- If not admin → returns 403 Forbidden error
- If admin → continues to controller

---

## 📝 Complete Function Reference

### Frontend Functions

#### `AuthContext.tsx`

**`login(email, password)`**
- **Purpose:** Log user in
- **Parameters:** email (string), password (string)
- **What it does:**
  1. Calls `authAPI.login()` to send request
  2. Receives token and user data
  3. Saves to state and localStorage
- **Returns:** Promise (nothing, but updates state)

**`register(username, email, password)`**
- **Purpose:** Create new user account
- **Parameters:** username, email, password (all strings)
- **What it does:** Same as login but calls register endpoint
- **Returns:** Promise

**`logout()`**
- **Purpose:** Log user out
- **Parameters:** None
- **What it does:**
  1. Clears state (sets user and token to null)
  2. Removes from localStorage
- **Returns:** Nothing

**`isAuthenticated`**
- **Purpose:** Check if user is logged in
- **Type:** Boolean
- **Value:** `!!token` (true if token exists)

**`isAdmin`**
- **Purpose:** Check if user is admin
- **Type:** Boolean
- **Value:** `user?.role === 'admin'`

---

#### `Dashboard.tsx`

**`loadSweets()`**
- **Purpose:** Fetch all sweets from server
- **Parameters:** None
- **What it does:**
  1. Sets loading to true
  2. Calls `sweetsAPI.getAll()`
  3. Updates `sweets` and `filteredSweets` state
  4. Sets loading to false
- **Returns:** Promise

**`handleSearch(filters)`**
- **Purpose:** Search/filter sweets
- **Parameters:** Object with optional name, category, minPrice, maxPrice
- **What it does:**
  1. If no filters → shows all sweets
  2. Otherwise → calls `sweetsAPI.search()`
  3. Updates `filteredSweets` state
- **Returns:** Promise

**`handlePurchase(sweetId, quantity)`**
- **Purpose:** Purchase a sweet
- **Parameters:** sweetId (string), quantity (number, default 1)
- **What it does:**
  1. Calls `sweetsAPI.purchase()`
  2. Reloads sweets to show updated quantity
- **Returns:** Promise

**`handleAddSweet(sweetData)`**
- **Purpose:** Add new sweet (admin only)
- **Parameters:** Object with name, category, price, quantity
- **What it does:**
  1. Calls `sweetsAPI.create()`
  2. Closes modal
  3. Reloads sweets
- **Returns:** Promise

**`handleUpdateSweet(sweetId, sweetData)`**
- **Purpose:** Update existing sweet (admin only)
- **Parameters:** sweetId (string), sweetData (partial object)
- **What it does:**
  1. Calls `sweetsAPI.update()`
  2. Closes edit modal
  3. Reloads sweets
- **Returns:** Promise

**`handleDeleteSweet(sweetId)`**
- **Purpose:** Delete sweet (admin only)
- **Parameters:** sweetId (string)
- **What it does:**
  1. Shows confirmation dialog
  2. If confirmed → calls `sweetsAPI.delete()`
  3. Reloads sweets
- **Returns:** Promise

**`handleRestock(sweetId, quantity)`**
- **Purpose:** Add more stock to sweet (admin only)
- **Parameters:** sweetId (string), quantity (number)
- **What it does:**
  1. Calls `sweetsAPI.restock()`
  2. Closes restock modal
  3. Reloads sweets
- **Returns:** Promise

---

#### `api.ts` - All API Functions

**`authAPI.register(data)`**
- **Request:** POST `/api/auth/register`
- **Body:** `{ username, email, password }`
- **Response:** `{ token, user, message }`

**`authAPI.login(data)`**
- **Request:** POST `/api/auth/login`
- **Body:** `{ email, password }`
- **Response:** `{ token, user, message }`

**`sweetsAPI.getAll()`**
- **Request:** GET `/api/sweets`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ sweets: [...] }`

**`sweetsAPI.search(params)`**
- **Request:** GET `/api/sweets/search?name=...&category=...`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ sweets: [...] }`

**`sweetsAPI.create(data)`**
- **Request:** POST `/api/sweets`
- **Headers:** `Authorization: Bearer <token>` (admin required)
- **Body:** `{ name, category, price, quantity }`
- **Response:** `{ sweet, message }`

**`sweetsAPI.update(id, data)`**
- **Request:** PUT `/api/sweets/:id`
- **Headers:** `Authorization: Bearer <token>` (admin required)
- **Body:** `{ name?, category?, price?, quantity? }` (partial)
- **Response:** `{ sweet, message }`

**`sweetsAPI.delete(id)`**
- **Request:** DELETE `/api/sweets/:id`
- **Headers:** `Authorization: Bearer <token>` (admin required)
- **Response:** `{ message }`

**`sweetsAPI.purchase(id, quantity)`**
- **Request:** POST `/api/sweets/:id/purchase`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ quantity }`
- **Response:** `{ sweet, message }`

**`sweetsAPI.restock(id, quantity)`**
- **Request:** POST `/api/sweets/:id/restock`
- **Headers:** `Authorization: Bearer <token>` (admin required)
- **Body:** `{ quantity }`
- **Response:** `{ sweet, message }`

---

### Backend Functions

#### `authController.ts`

**`register(req, res)`**
- **Route:** POST `/api/auth/register`
- **What it does:**
  1. Gets username, email, password from `req.body`
  2. Checks if user exists
  3. Hashes password
  4. Creates user in database
  5. Generates JWT token
  6. Returns token and user (without password)
- **Response:** 201 with `{ token, user, message }` or 400/500 error

**`login(req, res)`**
- **Route:** POST `/api/auth/login`
- **What it does:**
  1. Gets email, password from `req.body`
  2. Finds user by email
  3. Compares password (hashed)
  4. If valid → generates token
  5. Returns token and user
- **Response:** 200 with `{ token, user, message }` or 401 error

---

#### `sweetController.ts`

**`getAllSweets(req, res)`**
- **Route:** GET `/api/sweets`
- **Middleware:** `authenticate` (requires login)
- **What it does:**
  1. Finds all sweets in database
  2. Sorts by newest first
  3. Returns array
- **Response:** 200 with `{ sweets: [...] }`

**`searchSweets(req, res)`**
- **Route:** GET `/api/sweets/search`
- **Middleware:** `authenticate`
- **What it does:**
  1. Gets search params from `req.query`
  2. Builds MongoDB query
  3. Finds matching sweets
  4. Returns results
- **Response:** 200 with `{ sweets: [...] }`

**`createSweet(req, res)`**
- **Route:** POST `/api/sweets`
- **Middleware:** `authenticate`, `requireAdmin`
- **What it does:**
  1. Gets sweet data from `req.body`
  2. Creates new Sweet document
  3. Saves to database
  4. Returns created sweet
- **Response:** 201 with `{ sweet, message }` or 400/500 error

**`updateSweet(req, res)`**
- **Route:** PUT `/api/sweets/:id`
- **Middleware:** `authenticate`, `requireAdmin`
- **What it does:**
  1. Gets sweet ID from `req.params.id`
  2. Gets update data from `req.body`
  3. Finds and updates sweet
  4. Returns updated sweet
- **Response:** 200 with `{ sweet, message }` or 404/500 error

**`deleteSweet(req, res)`**
- **Route:** DELETE `/api/sweets/:id`
- **Middleware:** `authenticate`, `requireAdmin`
- **What it does:**
  1. Gets sweet ID from `req.params.id`
  2. Finds and deletes sweet
  3. Returns success message
- **Response:** 200 with `{ message }` or 404/500 error

**`purchaseSweet(req, res)`**
- **Route:** POST `/api/sweets/:id/purchase`
- **Middleware:** `authenticate`
- **What it does:**
  1. Gets sweet ID and quantity
  2. Finds sweet
  3. Checks if enough stock
  4. Subtracts quantity
  5. Saves to database
  6. Returns updated sweet
- **Response:** 200 with `{ sweet, message }` or 400/404/500 error

**`restockSweet(req, res)`**
- **Route:** POST `/api/sweets/:id/restock`
- **Middleware:** `authenticate`, `requireAdmin`
- **What it does:**
  1. Gets sweet ID and restock quantity
  2. Finds sweet
  3. Adds quantity to existing stock
  4. Saves to database
  5. Returns updated sweet
- **Response:** 200 with `{ sweet, message }` or 400/404/500 error

---

## 🎓 Key Concepts Summary

### State Management
- **Local State:** `useState` in components (like form inputs)
- **Global State:** `AuthContext` for user info (shared everywhere)
- **Server State:** Data fetched from API, stored in component state

### Data Flow
1. **User Action** → Component function
2. **Component** → API call
3. **API** → HTTP request to backend
4. **Backend** → Database query
5. **Database** → Returns data
6. **Backend** → Sends JSON response
7. **Frontend** → Updates state
8. **React** → Re-renders UI

### Authentication
- **Token:** JWT stored in localStorage
- **Middleware:** Checks token on every protected route
- **Context:** Makes user info available everywhere

### Authorization
- **Role-based:** User has 'user' or 'admin' role
- **Middleware:** `requireAdmin` checks role before allowing access
- **Frontend:** `isAdmin` hides/shows admin features

---

## 🚀 Quick Reference: Common Patterns

### Pattern 1: Fetching Data
```javascript
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getData();
      setData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### Pattern 2: Form Submission
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await api.submit(formData);
    // Success: redirect or show message
  } catch (err) {
    setError(err.message);
  }
};
```

### Pattern 3: Conditional Rendering
```javascript
{isAdmin && <AdminButton />}  // Show if admin
{loading ? <Spinner /> : <Content />}  // Show spinner while loading
{error && <ErrorMessage error={error} />}  // Show if error
```

---

## 📚 Additional Resources

- **React Docs:** https://react.dev
- **Express Docs:** https://expressjs.com
- **MongoDB Docs:** https://docs.mongodb.com
- **JWT:** https://jwt.io

---

**That's it! You now understand how the entire application works from frontend to backend! 🎉**

