import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

export type Post = { id: string; title: string };

type State = { posts: Post[]; nextId: number };

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(DIRNAME, "../var");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");

function computeNextId(posts: Post[]): number {
  let max = 0;
  for (const p of posts) {
    const n = Number.parseInt(p.id, 10);
    if (Number.isFinite(n)) max = Math.max(max, n);
  }
  return max + 1;
}

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(POSTS_FILE);
  } catch {
    const seed: State = {
      posts: [
        { id: "1", title: "Hello from API" },
        { id: "2", title: "Second post" },
      ],
      nextId: 3,
    };
    await fs.writeFile(POSTS_FILE, JSON.stringify(seed, null, 2), "utf8");
  }
}

async function loadState(): Promise<State> {
  await ensureDataFile();
  const text = await fs.readFile(POSTS_FILE, "utf8");
  const json = JSON.parse(text);

  // Migrate old shape { posts: [...] } (no nextId) or any legacy content.
  if (!("nextId" in json)) {
    const posts: Post[] = Array.isArray(json.posts) ? json.posts : [];
    return { posts, nextId: computeNextId(posts) };
  }
  return json as State;
}

async function saveState(state: State): Promise<void> {
  await ensureDataFile();
  const tmp = POSTS_FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(state, null, 2), "utf8");
  await fs.rename(tmp, POSTS_FILE);
}

export async function loadPosts(): Promise<Post[]> {
  return (await loadState()).posts;
}

export async function addPost(title: string): Promise<Post> {
  const state = await loadState();
  const post: Post = { id: String(state.nextId), title: title.trim() };
  state.posts.push(post);
  state.nextId += 1;
  await saveState(state);
  return post;
}


export async function updatePostTitle(id: string, title: string): Promise<Post | null> {
  const state = await loadState();
  const i = state.posts.findIndex(p => p.id === id);
  if (i === -1) return null;
  state.posts[i] = { ...state.posts[i], title: title.trim() };
  await saveState(state);
  return state.posts[i];
}

export async function deletePostById(id: string): Promise<boolean> {
  const state = await loadState();
  const before = state.posts.length;
  state.posts = state.posts.filter(p => p.id !== id);
  const changed = state.posts.length !== before;
  if (changed) await saveState(state);
  return changed;
}
