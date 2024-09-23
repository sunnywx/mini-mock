import { useState, useEffect } from "react";
// import type { Schema } from "@/amplify/data/resource";

import Layout from '@/components/postman/Layout';
import Request from '@/components/postman/Workspace/RequestPanel';
import Response from '@/components/postman/Workspace/ResponsePanel';

export default function HttpTester() {
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
}
