import Cors from "micro-cors";
import { ApolloServer, gql } from "apollo-server-micro";
import { MultiMatchQuery, SearchkitSchema } from "@searchkit/schema";

const searchkitConfig = {
  host: "http://localhost:9200",
  index: "my_index",
  hits: {
    fields: [],
  },
  query: new MultiMatchQuery({ fields: [] }),
  facets: [],
};

// Returns SDL + Resolvers for searchkit, based on the Searchkit config
const { typeDefs, withSearchkitResolvers, context } = SearchkitSchema({
  config: searchkitConfig, // searchkit configuration
  typeName: "ResultSet", // type name for Searchkit Root
  hitTypeName: "ResultHit", // type name for each search result
  addToQueryType: true, // When true, adds a field called results to Query type
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const cors = Cors();

const server = new ApolloServer({
  typeDefs: [
    gql`
      type Query {
        root: String
      }

      type HitFields {
        root: String
      }

      # Type name should match the hit typename
      type ResultHit implements SKHit {
        id: ID!
        fields: HitFields
      }
    `,
    ...typeDefs,
  ],
  resolvers: withSearchkitResolvers({}),
  introspection: true,
  playground: true,
  context: {
    ...context,
  },
});

const startServer = server.start();

export default cors(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.end();
    return false;
  }

  await startServer;
  await server.createHandler({ path: "/api/graphql" })(req, res);
});
