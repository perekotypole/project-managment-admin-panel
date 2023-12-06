import React, { useMemo } from 'react';
import Head from 'next/head';
import '../styles/globals.css';

import { useRouter } from 'next/router';

import MainLayout from '../components/layouts/Main.jsx';
import LoginLayout from '../components/layouts/Login.jsx';
import StatusPayment from '../components/mainPages/StatusPayment.jsx';

const App = ({ Component, pageProps }) => {
  const router = useRouter();
  const { pathname, query } = router;
  if (router.query.status) return <StatusPayment />;

  const Layout = useMemo(() => {
    if (!pathname) return function Empty() { return <></>; };
    if (query.status) {
      return function NoHeader({ children }) {
        return <MainLayout noheader>{children}</MainLayout>;
      };
    }

    return pathname === '/login' ? LoginLayout : MainLayout;
  }, [pathname, query.status]);

  return <>
    <Head>
      <title>QTeam</title>
    </Head>

    <Layout>
      <Component {...pageProps} />
    </Layout>
  </>;
};

export default App;
