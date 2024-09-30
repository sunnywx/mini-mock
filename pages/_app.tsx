import "@/styles/globals.css";
import "@/styles/app.css";
import "@radix-ui/themes/styles.css";

import type { AppProps } from "next/app";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import Layout from "@/components/app-layout";
import { Theme } from "@radix-ui/themes";
import axios from 'axios'
import {Toaster} from 'react-hot-toast'

const updateEndTime = (response: any) => {
  response.customData = response.customData || {};
  response.customData.time =
    new Date().getTime() - response.config.customData.startTime;
  return response;
};

axios.interceptors.request.use((request: any) => {
  request.customData = request.customData || {};
  request.customData.startTime = new Date().getTime();
  return request;
});

axios.interceptors.response.use(updateEndTime, (e) => {
  return Promise.reject(updateEndTime(e.response));
});

Amplify.configure(outputs);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Theme>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Toaster />
    </Theme>
  );
}
