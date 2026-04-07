const { createServer } = require("http");
const { createYoga, createSchema } = require("graphql-yoga");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const typeDefs = fs.readFileSync(
  path.join(__dirname, "schema.graphql"),
  "utf8"
);

// 🔥 Helper functions for cursor
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

      const endCursor =
        edges.length > 0 ? encodeCursor(endIndex) : null;

      const hasNextPage = endIndex < allProducts.length - 1;

      return {
        edges,
        pageInfo: {
          endCursor,
          hasNextPage,
        },
      };
    },

    productSearch: async (_, { query }) => {
      const res = await axios.get("https://fakestoreapi.com/products");
      const products = res.data;

      return products.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase())
      );
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