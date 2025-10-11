import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

import { API_BASE_URL } from "./api/apiConfig";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  farmerAuth: false,
  buyerAuth: false,
  loading: true, 
  
  checkAuth: () => {
    const token = localStorage.getItem('authToken');
    const userJson = localStorage.getItem('user'); // <-- FIX: Look for the 'user' object, not 'userRole'
    
    if (token && userJson) { // <-- FIX: Check for the full user object
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          const user = JSON.parse(userJson); // <-- FIX: Parse the user object from storage
          // Token is valid, set the state from the SAVED USER OBJECT
          set({ 
            user: user, // <-- FIX: Use the full user object
            token: token,
            farmerAuth: user.role === 'farmer', // <-- FIX: Get role from the user object
            buyerAuth: user.role === 'buyer',
          });
        } else {
          // Token is expired, clear everything
          localStorage.removeItem('authToken');
          localStorage.removeItem('user'); // <-- FIX: Clear the user object
        }
      } catch (error) {
        // Token is malformed, clear everything
        localStorage.removeItem('authToken');
        localStorage.removeItem('user'); // <-- FIX: Clear the user object
      }
    }
    set({ loading: false }); 
  },

  login: async (email, password) => {
    set({ loading: true }); 

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      console.log("user data: ",data)
      // data is now { access_token: "...", user: { id: 1, email: "...", role: "..." } }

      // --- KEY CHANGES ---
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user)); // <-- FIX: Save the full user object under the key 'user'

      set({
        user: data.user, // <-- FIX: Set the user state to the full user object from the API
        token: data.access_token,
        farmerAuth: data.user.role === 'farmer', // <-- FIX: Get role from data.user.role
        buyerAuth: data.user.role === 'buyer',   // <-- FIX: Get role from data.user.role
        loading: false,
      });
      // --------------------

      return { role: data.user.role }; // <-- FIX: Return the role from the user object

    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user'); // <-- FIX: Remove the 'user' object, not 'userRole'
    
    set({
      user: null,
      token: null,
      farmerAuth: false,
      buyerAuth: false,
    });
  },
}));