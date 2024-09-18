import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

import Layout from '@/components/postman/components/Layout/Layout';
import Request from '@/components/postman/components/Workspace/Request/RequestPanel';
import Response from '@/components/postman/components/Workspace/Response/ResponsePanel';

const client = generateClient<Schema>();

export default function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  function listTodos() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }

  // useEffect(() => {
  //   listTodos();
  // }, []);

  function createTodo() {
    client.models.Todo.create({
      content: window.prompt("Todo content"),
    });
  }

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Layout>
        <Request setResponse={setResponse} setLoading={setLoading} />
        <Response response={response} loading={loading} />
      </Layout>
    </>
  );

  // return (
  //   <main>
  //     {/* <h1>My todos</h1>
  //     <button onClick={createTodo}>+ new</button>
  //     <ul>
  //       {todos.map((todo) => (
  //         <li key={todo.id}>{todo.content}</li>
  //       ))}
  //     </ul> */}
  //   </main>
  // );
}
