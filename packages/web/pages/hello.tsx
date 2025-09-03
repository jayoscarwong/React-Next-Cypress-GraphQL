export async function getServerSideProps(){
  try{
    const res = await fetch("http://localhost:4000/api/hello");
    const data = await res.json();
    return { props: { message: data.message } };
  }catch{
    return { props: { message: "API not running" } };
  }
}
export default function Hello({ message }: any){ return <h1>{message}</h1>; }