import { useProducts } from "./hooks/useProducts";
import { useCart } from "./context/CartContext";

function App() {
  const { products, fetchNextPage, hasNextPage } = useProducts();
  const { cart, addToCart, error } = useCart();

  return (
    <div style={{ padding: "20px" }}>
      <h1>E-Commerce Store</h1>

      {/* ✅ REQUIRED */}
      <h2 data-testid="cart-count">Cart: {cart.length}</h2>

      {/* ✅ REQUIRED */}
      {error && (
        <div data-testid="error-toast" style={{ color: "red" }}>
          {error}
        </div>
      )}

      <div data-testid="product-list">
        {products.map((product) => (
          <div key={product.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            <img src={product.image} width="100" />
            <h3>{product.title}</h3>
            <p>₹{product.price}</p>

            <button
              data-testid={`add-to-cart-${product.id}`}
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {hasNextPage && (
        <button data-testid="next-page-button" onClick={fetchNextPage}>
          Load More
        </button>
      )}
    </div>
  );
}

export default App;