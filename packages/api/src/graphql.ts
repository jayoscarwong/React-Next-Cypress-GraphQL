import type { Express } from "express";
import { createSchema, createYoga } from "graphql-yoga";
import { loadPosts, addPost, updatePostTitle, deletePostById, type Post } from "./storage.ts";

const typeDefs = /* GraphQL */ `
  type Post { id: ID!, title: String! }
  type Query {
    posts(search: String): [Post!]!
  }
  type Mutation {
    addPost(title: String!): Post!
    updatePost(id: ID!, title: String!): Post
    deletePost(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    posts: async (_: unknown, args: { search?: string }) => {
      const posts = await loadPosts();
      if (!args?.search) return posts;
      const s = args.search.toLowerCase();
      return posts.filter((p: Post) => p.title.toLowerCase().includes(s));
    },
  },
  Mutation: {
    addPost: async (_: unknown, { title }: { title: string }) => addPost(title),
    updatePost: async (_: unknown, { id, title }: { id: string; title: string }) =>
      updatePostTitle(id, title),
    deletePost: async (_: unknown, { id }: { id: string }) =>
      deletePostById(id),
  },
};

export const schema = createSchema({ typeDefs, resolvers });

export function mountGraphQL(app: Express) {
  const yoga = createYoga({ schema, graphqlEndpoint: "/graphql" });
  app.use("/graphql", yoga);
}
