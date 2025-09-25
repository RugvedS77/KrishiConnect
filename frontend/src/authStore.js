// src/authStore.js

import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  farmerAuth: false,
  buyerAuth: false,
  loading: true, 
  
  /**
   * CHECKAUTH (MODIFIED):
   * Now also checks for a 'userRole' in localStorage.
   */
  checkAuth: () => {
    const token = localStorage.getItem('authToken');
    const savedRole = localStorage.getItem('userRole'); // <-- ADDED
    
    if (token && savedRole) { // <-- MODIFIED (must have token AND role)
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          // Token is valid, use the SAVED ROLE
          set({ 
            user: { email: decoded.sub, role: savedRole }, // Use savedRole
            token: token,
            farmerAuth: savedRole === 'farmer', // Set flags based on savedRole
            buyerAuth: savedRole === 'buyer',
          });
        } else {
          // Token is expired, clear everything
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole'); // <-- ADDED
        }
      } catch (error) {
        // Token is malformed, clear everything
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole'); // <-- ADDED
      }
    }
    set({ loading: false }); 
  },

  /**
   * LOGIN (MODIFIED):
   * Now accepts a 'roleHint' (e.g., 'farmer' or 'buyer') from the component.
   */
  login: async (email, password, userRole) => { // <-- roleHint ADDED
    set({ loading: true }); 

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      const token = data.access_token;
      const decoded = jwtDecode(token);// We still decode for 'sub' and 'exp'

      const userRole = data.userRole;
      // --- KEY CHANGES ---
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', userRole); // <-- ADDED: Save the role hint

      // Set state using the roleHint, not decoded.role
      set({
        user: { email: decoded.sub, role: userRole }, // Use roleHint
        token: token,
        farmerAuth: userRole === 'farmer', // Use roleHint
        buyerAuth: userRole === 'buyer',   // Use roleHint
        loading: false,
      });
      // --------------------

      return { role: userRole }; // Return the role we were given

    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  /**
   * LOGOUT (MODIFIED):
   * Now also clears the 'userRole' from localStorage.
   */
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole'); // <-- ADDED
    localStorage.removeItem('farmerAuth'); // (Kept just in case)
    localStorage.removeItem('buyerAuth'); // (Kept just in case)
    
    set({
      user: null,
      token: null,
      farmerAuth: false,
      buyerAuth: false,
    });
  },
}));