import { createContext, useContext, useState } from "react";
import { graphqlRequest } from "../api/graphqlClient";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null);

  const addToCart = async (product) => {
    const tempId = "temp-" + Date.now();

    // ✅ Optimistic UI
    const optimisticItem = {
      id: tempId,
      productId: product.id,
      title: product.title,
    };

    setCart((prev) => [...prev, optimisticItem]);

    try {
      const data = await graphqlRequest(
        `
        mutation AddToCart($productId: ID!) {
          addToCart(productId: $productId) {
            items {
              id
              productId
              title
            }
          }
        }
        `,
        { productId: product.id }
      );

      // ✅ Replace temp data
      setCart(data.addToCart.items);
    } catch (err) {
      // ❌ Rollback
      setCart((prev) => prev.filter((item) => item.id !== tempId));
      setError(err.message);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, error, setError }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);