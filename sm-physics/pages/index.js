import Head from 'next/head';
import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import WhyChooseUs from '../components/home/WhyChooseUs';
import Testimonials from '../components/home/Testimonials';
import CTASection from '../components/home/CTASection';

export default function Home() {
  return (
    <>
      <Head>
        <title>SM Physics – Premium Physics Coaching | JEE · NEET · WBJEE</title>
      </Head>
      <Layout>
        <Hero />
        <WhyChooseUs />
        <Testimonials />
        <CTASection />
      </Layout>
    </>
  );
}
