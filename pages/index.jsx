import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Project from '../components/mainPages/Project';
import StatusPayment from '../components/mainPages/StatusPayment';

const Home = () => {
  const router = useRouter()

  if (router.query.status) return <StatusPayment/>
  if (router.query.project) return <Project/>

  return <Layout>
  </Layout>
}

export default Home