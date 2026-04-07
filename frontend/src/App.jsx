import { useProducts } from "./hooks/useProducts";

function App() {
  const { products, fetchNextPage, hasNextPage } = useProducts();

  return (
    <div style={{ padding: "20px" }}>
      <h1>E-Commerce Store</h1>

      {/* ✅ REQUIRED TEST ID */}
      <div data-testid="product-list">
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #ccc",
              margin: "10px",
              padding: "10px",
            }}
          >
            <img src={product.image} width="100" />
            <h3>{product.title}</h3>
            <p>₹{product.price}</p>

            {/* Add button later */}
            <button data-testid={`add-to-cart-${product.id}`}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {hasNextPage && (
        <button
          data-testid="next-page-button"
          onClick={fetchNextPage}
        >
          Load More
        </button>
      )}
    </div>
  );
}

export default App;