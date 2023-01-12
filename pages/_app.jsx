import Head from 'next/head';

import '../styles/globals.css'

const App = ({ Component, pageProps }) => {

  return <>
    <Head>
      <title>QTeam</title>
    </Head>

    <Component {...pageProps} />
  </>
}

export default App
