import { create } from 'zustand';

// Cart item interface
interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl?: string;
}

// Cart state interface
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalAmount: number;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
}

// Helper function to calculate totals
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { totalItems, totalAmount };
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  totalItems: 0,
  totalAmount: 0,

  addItem: (newItem) => set((state) => {
    const existingItemIndex = state.items.findIndex(
      item => item.productId === newItem.productId && item.variantId === newItem.variantId
    );

    let updatedItems;
    if (existingItemIndex !== -1) {
      // Item exists, update quantity
      updatedItems = state.items.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
          : item
      );
    } else {
      // New item, add to cart
      updatedItems = [...state.items, { ...newItem, quantity: newItem.quantity || 1 }];
    }

    const { totalItems, totalAmount } = calculateTotals(updatedItems);
    return {
      items: updatedItems,
      totalItems,
      totalAmount,
    };
  }),

  removeItem: (productId, variantId) => set((state) => {
    const updatedItems = state.items.filter(
      item => !(item.productId === productId && item.variantId === variantId)
    );
    const { totalItems, totalAmount } = calculateTotals(updatedItems);
    return {
      items: updatedItems,
      totalItems,
      totalAmount,
    };
  }),

  updateQuantity: (productId, quantity, variantId) => {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      get().removeItem(productId, variantId);
      return;
    }

    set((state) => {
      const updatedItems = state.items.map(item =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity }
          : item
      );
      const { totalItems, totalAmount } = calculateTotals(updatedItems);
      return {
        items: updatedItems,
        totalItems,
        totalAmount,
      };
    });
  },

  clearCart: () => set({
    items: [],
    totalItems: 0,
    totalAmount: 0,
  }),

  toggleCart: () => set((state) => ({
    isOpen: !state.isOpen,
  })),
}));
