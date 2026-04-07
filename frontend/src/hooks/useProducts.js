import { useState, useEffect } from "react";
import { graphqlRequest } from "../api/graphqlClient";

const QUERY = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          title
          price
          image
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    endCursor: null,
    hasNextPage: true,
  });

  const fetchProducts = async (cursor = null) => {
    const data = await graphqlRequest(QUERY, {
      first: 5,
      after: cursor,
    });

    const newProducts = data.products.edges.map((e) => e.node);

    setProducts((prev) => [...prev, ...newProducts]);
    setPageInfo(data.products.pageInfo);
  };

  useEffect(() => {
    fetchProducts(null);
  }, []);

  const fetchNextPage = () => {
    if (pageInfo.hasNextPage) {
      fetchProducts(pageInfo.endCursor);
    }
  };

  return {
    products,
    fetchNextPage,
    hasNextPage: pageInfo.hasNextPage,
  };
}