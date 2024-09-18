import "@/styles/globals.css";
import "@/styles/app.css";
import "@radix-ui/themes/styles.css";

import type { AppProps } from "next/app";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import Layout from "@/components/layout";
import { Theme } from "@radix-ui/themes";

Amplify.configure(outputs);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Theme>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Theme>
  );
}
