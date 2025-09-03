export async function getServerSideProps(){
  const query = { query: "query { users { id name } }" };
  try{
    const res = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query)
    });
    const json = await res.json();
    return { props: { users: json.data?.users ?? [], error: null } };
  }catch(e:any){
    return { props: { users: [], error: e?.message ?? "GraphQL endpoint not reachable" } };
  }
}
export default function Gql({ users, error }: any){
  return (
    <main style={{ padding: 24 }}>
      <h1>GraphQL Users</h1>
      {error ? <p style={{color: 'crimson'}}>Error: {error}</p> : null}
      {users.length === 0 ? <p>(No users yet)</p> :
        <ul>{users.map((u:any)=>(<li key={u.id}>{u.name}</li>))}</ul>}
    </main>
  );
}