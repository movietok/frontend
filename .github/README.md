# MovieTok Frontend

MovieTok Frontend is a modern, feature-rich web application built with React and Vite. It serves as the client interface for the MovieTok platform — a social movie discovery hub where users can browse films, write reviews, create groups, and share recommendations.

## 🎬 Features

### Movie Discovery
- Browse popular and now playing movies
  ```jsx
  // Uses TMDB API integration through a custom service
  const movies = await getPopularMovies(page);
  const nowPlaying = await getNowPlayingMovies();
  ```
- Advanced movie search functionality with filters
  ```jsx
  // Supports genre filtering through URL parameters
  const movies = await discoverMovies({ 
    withGenres: selectedGenres,
    page: currentPage 
  });
  ```
- Detailed movie information via TMDB integration
  ```jsx
  // Fetches comprehensive movie data
  const details = await getMovieDetails(movieId);
  ```
- Local theater showtimes through Finnkino API
  ```jsx
  // Custom hook for real-time theater data
  const { showtimes, loading } = useFinnkinoShowTimes();
  ```

### User Features
- Authentication System
  ```jsx
  // Uses JWT tokens with Context API
  const AuthContext = createContext();
  // Stores tokens securely
  localStorage.setItem("token", jwt);
  // Protected route wrapper
  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };
  ```
- Profile Management
  ```jsx
  // Custom hook for profile operations
  const { profile, loading } = useProfile(userId);
  // Handles user data and preferences
  const updateProfile = async (data) => {
    await updateUserProfile(userId, data);
  };
  ```

### Social Features
#### Groups
- Group Management System
  ```jsx
  // Service for group operations
  export const createGroup = async (groupData) => {
    const token = requireToken();
    const res = await groupAPI.post("", groupData);
    return res.data.group;
  };
  ```
- Custom Hook for Group Data
  ```jsx
  // Real-time group management
  const { userGroups, groupsLoading } = useUserGroups(userId);
  ```
- Member Management
  ```jsx
  // Handles member operations
  const addMember = async (groupId, userId) => {
    await groupAPI.post(`/${groupId}/members`, { userId });
  };
  ```

#### Reviews
- Review System Implementation
  ```jsx
  // Normalized review structure
  const normalizeReview = (r) => ({
    id: r?.id,
    movieId: r?.movie_id,
    rating: Number(r?.rating ?? 0),
    content: r?.content
  });
  ```
- Interactive Rating System
  ```jsx
  // Handles review creation with ratings
  const createReview = async ({ movieId, rating, comment }) => {
    await api.post("/reviews", { 
      movieId, 
      rating, 
      content: comment 
    });
  };
  ```

#### Lists & Collections
- Favorites Management
  ```jsx
  // Custom hook for favorites
  const { favorites, add, remove } = useFavorites(userId, type);
  // Real-time favorite status tracking
  const { isFavorite } = useFavoriteStatuses(movieId);
  ```
- Watchlist System
  ```jsx
  // Similar to favorites but with watch status
  const toggleWatchlist = async (movieId) => {
    const updated = await updateWatchStatus(movieId);
    setWatchlist(prev => [...prev, updated]);
  };
  ```

### Interactive Components
- Universal Modal System
  ```jsx
  // Reusable modal component
  const UniversalModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return createPortal(
      <div className="modal-overlay">{children}</div>,
      document.body
    );
  };
  ```
- Notification System
  ```jsx
  // Auto-dismiss toast notifications
  const { showToast } = usePopup();
  showToast("Operation successful", "success", 3000);
  ```
- Responsive Component Design
  ```jsx
  // Tailwind CSS responsive classes
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  ```

## 🛠️ Technical Implementation

### State Management
- Context API for Global State
  ```jsx
  // Centralized authentication state management
  const AuthContext = createContext();
  export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(
      !!localStorage.getItem("token")
    );
    // ... authentication logic
  }
  ```

- Custom Hooks Architecture
  1. Favorites Management (`useFavorites`)
     ```jsx
     const useFavorites = (userId, type) => {
       const [favorites, setFavorites] = useState([]);
       // Real-time favorites sync with backend
       useEffect(() => {
         getUserFavorites(userId, type)
           .then(data => setFavorites(data));
       }, [userId, type]);
       // ... CRUD operations
     };
     ```

  2. Group Management (`useUserGroups`)
     ```jsx
     const useUserGroups = (userId) => {
       const [userGroups, setUserGroups] = useState([]);
       // Automatic error handling and loading states
       const [groupsLoading, setGroupsLoading] = useState(true);
       const [groupsError, setGroupsError] = useState(null);
       // ... group synchronization logic
     };
     ```

  3. Notification System (`usePopup`)
     ```jsx
     const usePopup = () => {
       const [showPopup, setShowPopup] = useState(false);
       const [popupMessage, setPopupMessage] = useState("");
       
       // Reusable popup component with type support
       const PopupComponent = showPopup ? (
         <OnsitePopup
           message={popupMessage}
           type={popupType}
           onConfirm={() => setShowPopup(false)}
         />
       ) : null;
       // ... popup trigger logic
     };
     ```

### API Integration Architecture
- Modular API Service Structure
  ```javascript
  // Separate axios instances for different domains
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  export const api = axios.create({
    baseURL: `${API_BASE_URL}/`,
  });
  
  export const authAPI = axios.create({
    baseURL: `${API_BASE_URL}/v1/users`,
  });
  
  export const groupAPI = axios.create({
    baseURL: `${API_BASE_URL}/groups`,
  });
  ```

- External API Integration
  1. TMDB API Service
     ```javascript
     // Centralized movie data fetching
     export async function getMovieDetails(id) {
       const res = await axios.get(`${API_BASE}/tmdb/${id}`);
       return res.data;
     }
     
     // Genre-based discovery
     export async function discoverMovies({ withGenres, page }) {
       const params = new URLSearchParams();
       if (withGenres.length > 0) {
         params.append("with_genres", withGenres.join(","));
       }
       // ... discovery logic
     }
     ```

  2. Finnkino Integration
     ```javascript
     // Real-time theater data
     const useFinnkinoShowTimes = () => {
       // Automatic data refresh
       useEffect(() => {
         const fetchShowTimes = async () => {
           const data = await finnkinoApi.getShowTimes();
           setShowTimes(data);
         };
         fetchShowTimes();
         // Refresh every 5 minutes
         const interval = setInterval(fetchShowTimes, 300000);
         return () => clearInterval(interval);
       }, []);
     };
     ```

- Backend Service Integration
  ```javascript
  // Normalized data handling
  const normalizeReview = (r) => ({
    id: r?.id,
    movieId: r?.movie_id,
    rating: Number(r?.rating ?? 0),
    // ... data normalization
  });
  
  // Type-safe API calls
  export async function createReview({ movieId, rating, comment }) {
    const token = requireToken();
    return api.post("/reviews", {
      movieId,
      rating,
      content: comment
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  ```

### Styling
- CSS modules for component-specific styling
- Responsive design
- Tailwind CSS integration
- Custom animations and transitions

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with:
```env
VITE_API_BASE_URL=your_api_base_url
```

4. Start the development server:
```bash
npm run dev
```

## 📦 Project Structure

- `/components` - Reusable UI components
- `/context` - React Context providers
- `/helpers` - Utility functions
- `/hooks` - Custom React hooks
- `/pages` - Main application pages/routes
- `/services` - API service integrations
- `/styles` - CSS stylesheets

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 💻 Technologies

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- ESLint
- PostCSS

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop browsers
- Tablets
- Mobile devices

## 🔒 Security

- JWT-based authentication
- Secure API communication
- Protected routes
- XSS protection

## 🤝 Contributors

@vem882
@saintcernunnos
@VeikkaKosk

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
