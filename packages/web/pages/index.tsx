import { useEffect, useState } from "react";

export async function getServerSideProps() {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL!;
    const res = await fetch(`${base}/api/posts`);
    const data = await res.json();
    return { props: { posts: data.docs ?? [] } };
  } catch {
    return { props: { posts: [] } };
  }
}


export default function Home({ posts: initialPosts }: { posts: any[] }) {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const [q, setQ] = useState("");
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // search (client-side)
/*   useEffect(() => {
    if (q.trim() === "") { setPosts(initialPosts); return; }
    const ctrl = new AbortController();
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`${base}/api/posts?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = await res.json();
        setPosts(data.docs ?? []);
      } catch {}
      finally { setLoading(false); }
    }, 250);
    return () => { clearTimeout(id); ctrl.abort(); };
  }, [q, initialPosts, base]); */
 // always fetch fresh (with/without q)
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const url = q.trim() ? `${base}/api/posts?q=${encodeURIComponent(q)}` : `${base}/api/posts`;
        const data = await fetch(url, { signal: ctrl.signal }).then(r => r.json());
        setPosts(data.docs ?? []);
      } finally { setLoading(false); }
    }, 250);
    return () => { clearTimeout(id); ctrl.abort(); };
  }, [q, base]);

  return () => {
    clearTimeout(id);
    ctrl.abort();
  };
}, [q]); // 👈 note: remove initialPosts/base from deps; base is stable from env

 async function refresh() {
    const url = q.trim() ? `${base}/api/posts?q=${encodeURIComponent(q)}` : `${base}/api/posts`;
    const data = await fetch(url).then(r => r.json());
    setPosts(data.docs ?? []);
  }
  
async function addPost(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setCreating(true);
    try {
      const res = await fetch(`${base}/api/posts`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: t }),
      });
      if (!res.ok) alert("Failed to create");
      setTitle("");
      await refresh();
    } finally { setCreating(false); }
  }

  function startEdit(p: any) {
    setEditId(p.id);
    setEditTitle(p.title);
  }
  function cancelEdit() {
    setEditId(null);
    setEditTitle("");
  }
  async function saveEdit() {
    if (!editId || !editTitle.trim()) return;
    const res = await fetch(`${base}/api/posts`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: editId, title: editTitle.trim() }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j?.error ?? "Failed to update");
      return;
    }
    await refresh();
    cancelEdit();
  }
  async function removePost(id: string) {
    const ok = confirm("Delete this post?");
    if (!ok) return;
    const res = await fetch(`${base}/api/posts/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j?.error ?? "Failed to delete");
      return;
    }
    await refresh();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Blog Posts</h1>

      {/* Create */}
      <form onSubmit={addPost} style={{ margin: "12px 0", display: "flex", gap: 8 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New post title…"
          style={{ padding: 8, width: 260 }}
          aria-label="New post title"
        />
        <button type="submit" disabled={!title.trim() || creating}>
          {creating ? "Adding…" : "Add"}
        </button>
      </form>

      {/* Search */}
      <div style={{ margin: "12px 0" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search posts…"
          style={{ padding: 8, width: 260 }}
          aria-label="Search posts"
        />
        {loading ? <span style={{ marginLeft: 8 }}>Loading…</span> : null}
      </div>

      {posts.length === 0 ? <p>(CMS not running → showing empty list)</p> : null}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {posts.map((p: any) => (
          <li key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            {editId === p.id ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ padding: 6, width: 260 }}
                  aria-label="Edit title"
                />
                <button onClick={saveEdit} disabled={!editTitle.trim()}>Save</button>
                <button onClick={cancelEdit} type="button">Cancel</button>
              </>
            ) : (
              <>
                <span>{p.title}</span>
                <button onClick={() => startEdit(p)} type="button">Edit</button>
                <button onClick={() => removePost(p.id)} type="button">Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}