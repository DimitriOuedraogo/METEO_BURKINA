// pages/_app.tsx
import { SessionProvider } from "next-auth/react";
import type { AppProps } from 'next/app';
import '../styles/globals.css'; 
import '../styles/sidebar.module.css';

function MyApp({ Component, pageProps }: AppProps) {
 return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
