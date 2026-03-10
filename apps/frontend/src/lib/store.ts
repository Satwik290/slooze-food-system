import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  regionId: string;
}

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface AppState {
  user: User | null;
  token: string | null;
  cart: CartItem[];
  cartRestaurantId: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  addToCart: (item: CartItem, restaurantId: string) => void;
  removeFromCart: (menuItemId: string) => void;
  clearCart: () => void;
  logout: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  token: null,
  cart: [],
  cartRestaurantId: null,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('slooze_token', token);
    } else {
      localStorage.removeItem('slooze_token');
    }
    set({ token });
  },

  addToCart: (item, restaurantId) => {
    const { cart, cartRestaurantId } = get();
    
    // Reset cart if adding from a different restaurant
    if (cartRestaurantId && cartRestaurantId !== restaurantId) {
      set({ cart: [item], cartRestaurantId: restaurantId });
      return;
    }

    const existingItem = cart.find((c) => c.menuItemId === item.menuItemId);
    if (existingItem) {
      set({
        cart: cart.map((c) =>
          c.menuItemId === item.menuItemId
            ? { ...c, quantity: c.quantity + item.quantity }
            : c
        ),
        cartRestaurantId: restaurantId,
      });
    } else {
      set({ cart: [...cart, item], cartRestaurantId: restaurantId });
    }
  },

  removeFromCart: (menuItemId) => {
    const { cart } = get();
    const newCart = cart.filter((c) => c.menuItemId !== menuItemId);
    set({ 
      cart: newCart, 
      cartRestaurantId: newCart.length === 0 ? null : get().cartRestaurantId 
    });
  },

  clearCart: () => set({ cart: [], cartRestaurantId: null }),

  logout: () => {
    localStorage.removeItem('slooze_token');
    set({ user: null, token: null, cart: [], cartRestaurantId: null });
  },
}));
