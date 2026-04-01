import Navbar from '@/app/components/Navbar';
import HeroSection from '@/app/components/HeroSection';
import Footer from '@/app/components/Footer';
import Dashboard from '@/app/components/Dashboard';
import Image from 'next/image';

export default function Home() {
  return (
    <div className='relative min-h-screen bg-[#F9FAF5] overflow-hidden'>
      <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
        <Image
          src='/logo.jpeg'
          alt='TulsiRaksha watermark'
          width={1200}
          height={1200}
          className='w-[85vw] max-w-[1200px] h-auto opacity-[0.07] select-none'
          priority
        />
      </div>

      <div className='relative z-10'>
      <Navbar />
      <main>
        <HeroSection />
        <Dashboard />
      </main>
      <Footer />
      </div>
    </div>
  );
}
