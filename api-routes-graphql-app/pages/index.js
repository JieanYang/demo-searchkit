// pages/index.js

import { gql, useQuery } from "@apollo/client";
import withApollo from "../lib/withApollo";

const QUERY = gql`
  query resultSet {
    results {
      hits {
        items {
          id
        }
      }
    }
  }
`;

const Index = () => {
  const { loading, previousData, data = previousData } = useQuery(QUERY);

  if (loading || !data) {
    return <h1>loading...</h1>;
  }
  return (
    <>
      {data.results.hits.items.map((item) => {
        return <div key={item.id}>hit id: {item.id}</div>;
      })}
    </>
  );
};

export default withApollo(Index);
