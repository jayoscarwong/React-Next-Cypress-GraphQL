import { useRouter } from "next/router";
export default function Post(){
  const { query } = useRouter();
  return <h1>Post ID: {query.id}</h1>;
}