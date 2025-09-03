// packages/web/pages/api/posts.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1) Adjust this query to match your schema if needed.
    const query = /* GraphQL */ `
      query {
        posts {
          id
          title
        }
      }
    `;

    const resp = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(502).json({ error: 'Upstream error', detail: text });
    }

    const json = await resp.json();

    // 2) Map GraphQL result to the shape the page expects: { docs: [...] }
    //    If your root field is different (e.g., allPosts/articles), change here:
    const docs = json?.data?.posts ?? [];
    return res.status(200).json({ docs });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? 'Unknown error' });
  }
}
