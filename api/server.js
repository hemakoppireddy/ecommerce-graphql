const { createServer } = require("http");
const { createYoga, createSchema } = require("graphql-yoga");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const typeDefs = fs.readFileSync(
  path.join(__dirname, "schema.graphql"),
  "utf8"
);

// 🔥 In-memory cart
let cart = [];

// 🔥 Cursor helpers
function encodeCursor(index) {
  return Buffer.from(`product:${index}`).toString("base64");
}

function decodeCursor(cursor) {
  const decoded = Buffer.from(cursor, "base64").toString("ascii");
  return parseInt(decoded.split(":")[1]);
}

const resolvers = {
  Query: {
    // ✅ Pagination
    products: async (_, { first, after }) => {
      const res = await axios.get("https://fakestoreapi.com/products");
      const allProducts = res.data;

      let startIndex = 0;
      if (after) {
        const index = decodeCursor(after);
        startIndex = index + 1;
      }

      const sliced = allProducts.slice(startIndex, startIndex + first);

      const edges = sliced.map((product, i) => {
        const index = startIndex + i;
        return {
          node: product,
          cursor: encodeCursor(index),
        };
      });

      const endIndex = startIndex + sliced.length - 1;

      return {
        edges,
        pageInfo: {
          endCursor: edges.length > 0 ? encodeCursor(endIndex) : null,
          hasNextPage: endIndex < allProducts.length - 1,
        },
      };
    },

    // 🔍 Search
    productSearch: async (_, { query }) => {
      const res = await axios.get("https://fakestoreapi.com/products");
      const products = res.data;

      return products.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase())
      );
    },
  },

  Mutation: {
    // 🛒 Add to Cart
    addToCart: async (_, { productId }) => {
      // ❌ Simulated error (REQUIRED)
      if (productId === "999") {
        throw new Error("Product not available");
      }

      const res = await axios.get("https://fakestoreapi.com/products");
      const product = res.data.find((p) => p.id == productId);

      const newItem = {
        id: Date.now().toString(),
        productId: productId,
        title: product?.title || "Unknown",
      };

      cart.push(newItem);

      return { items: cart };
    },

    // 🗑️ Remove from Cart
    removeFromCart: (_, { itemId }) => {
      cart = cart.filter((item) => item.id !== itemId);
      return { items: cart };
    },
  },
};

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  cors: {
    origin: "*",
  },
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.log("GraphQL running on http://localhost:4000/graphql");
});