import Head from 'next/head'
import '../styles/globals.css'

import { useMemo } from 'react'
import { useRouter } from 'next/router'

import MainLayout from '../components/layouts/Main'
import LoginLayout from '../components/layouts/Login'

const App = ({ Component, pageProps }) => {
  const router = useRouter()
  const { pathname, query } = router
  if (router.query.status) return <StatusPayment />

  const Layout = useMemo(() => {
    if (!pathname) return () => <></>
    if (query.status) return ({ children }) => <MainLayout noheader>{children}</MainLayout>

    return pathname === '/login' ? LoginLayout : MainLayout
  }, [pathname, query.status])

  return <>
    <Head>
      <title>QTeam</title>
    </Head>

    <Layout>
      <Component {...pageProps} />
    </Layout>
  </>
}

export default App
