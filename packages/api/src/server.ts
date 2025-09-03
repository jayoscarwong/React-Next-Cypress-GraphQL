import express from "express";
import cors from "cors";
import { graphql } from "graphql";
import { mountGraphQL, schema } from "./graphql.ts";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

mountGraphQL(app);

// GET /api/posts -> { docs: [...] }
app.get("/api/posts", async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const result = await graphql({
      schema,
      source: `query($search:String){ posts(search:$search){ id title } }`,
      variableValues: { search: q },
    });
    if (result.errors?.length) {
      return res.status(500).json({ error: "GraphQL errors", details: result.errors.map(e => e.message) });
    }
    res.json({ docs: (result.data as any)?.posts ?? [] });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Unknown error" });
  }
});

// POST /api/posts -> { doc: { id, title } }
app.post("/api/posts", async (req, res) => {
  try {
    const title = String(req.body?.title ?? "").trim();
    if (!title) return res.status(400).json({ error: "Title is required" });

    const result = await graphql({
      schema,
      source: `mutation($title:String!){ addPost(title:$title){ id title } }`,
      variableValues: { title },
    });

    if (result.errors?.length) {
      return res.status(500).json({ error: "GraphQL errors", details: result.errors.map(e => e.message) });
    }
    const doc = (result.data as any)?.addPost;
    res.status(201).json({ doc });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Unknown error" });
  }
});


// PATCH /api/posts  body: { id, title } -> { doc | null }
app.patch("/api/posts", async (req, res) => {
  try {
    const id = String(req.body?.id ?? "");
    const title = String(req.body?.title ?? "").trim();
    if (!id || !title) return res.status(400).json({ error: "id and title are required" });

    const result = await graphql({
      schema,
      source: `mutation($id:ID!, $title:String!){ updatePost(id:$id, title:$title){ id title } }`,
      variableValues: { id, title },
    });

    if (result.errors?.length) {
      return res.status(500).json({ error: "GraphQL errors", details: result.errors.map(e => e.message) });
    }
    res.json({ doc: (result.data as any)?.updatePost ?? null });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Unknown error" });
  }
});

// DELETE /api/posts/:id  -> { ok: boolean }
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const id = String(req.params.id);
    const result = await graphql({
      schema,
      source: `mutation($id:ID!){ deletePost(id:$id) }`,
      variableValues: { id },
    });

    if (result.errors?.length) {
      return res.status(500).json({ error: "GraphQL errors", details: result.errors.map(e => e.message) });
    }
    res.json({ ok: Boolean((result.data as any)?.deletePost) });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Unknown error" });
  }
});





app.get("/", (_req, res) => res.json({ ok: true, endpoints: ["/graphql", "/api/posts"] }));
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
