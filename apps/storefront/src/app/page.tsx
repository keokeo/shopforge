"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Headphones } from 'lucide-react';

export default function Home() {
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemFadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  return (
    <>
      {/* Global Noise Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center bg-paper pt-20 border-b border-stone-200">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
          >
            <div className="lg:col-span-8 flex flex-col items-start text-left">
              <motion.span variants={itemFadeUp} className="text-sm tracking-[0.2em] uppercase text-stone-900 mb-6 font-semibold before:content-[''] before:inline-block before:w-8 before:h-px before:bg-ink before:mr-4 before:align-middle">
                卓越品质，重新定义
              </motion.span>
              <motion.h1 variants={itemFadeUp} className="font-serif text-6xl md:text-8xl lg:text-[7rem] leading-[0.9] text-ink tracking-tight mb-8">
                Discover <br />
                <span className="italic text-stone-800">The Exceptional</span>
              </motion.h1>
              <motion.p variants={itemFadeUp} className="text-xl md:text-2xl text-stone-900/70 mb-12 max-w-xl font-light leading-relaxed">
                ShopForge curates global artifacts for the modern connoisseur. Experience uncompromised quality and absolute minimal resistance.
              </motion.p>
              
              <motion.div variants={itemFadeUp}>
                <Link
                  href="/products"
                  className="group relative inline-flex items-center justify-center px-10 py-5 bg-ink text-paper text-sm tracking-widest uppercase overflow-hidden hover:text-ink transition-colors duration-500 border border-ink"
                >
                  <span className="relative z-10 font-semibold flex items-center">
                    Explore Collection
                    <svg className="w-4 h-4 ml-3 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-paper transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-in-out z-0"></div>
                </Link>
              </motion.div>
            </div>
            
            <motion.div variants={itemFadeUp} className="lg:col-span-4 hidden lg:block h-full relative border-l border-ink/10 pl-12 flex flex-col justify-end pb-12">
               <div className="text-xs uppercase tracking-widest text-stone-400 rotate-90 origin-left absolute bottom-12 -left-6 whitespace-nowrap">
                 Vol. 01 / Selected Goods
               </div>
               <div className="w-full h-[500px] bg-stone-100 relative group overflow-hidden">
                 <div className="absolute inset-0 bg-ink/5 group-hover:bg-transparent transition duration-700"></div>
               </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Brutalist Grid */}
      <section className="bg-paper text-ink relative py-32 border-b border-stone-200">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20"
          >
            <h2 className="font-serif text-5xl md:text-6xl max-w-lg leading-tight">
              A standard <br /> uncompromising.
            </h2>
            <p className="text-stone-500 uppercase tracking-widest text-xs mt-6 md:mt-0 md:max-w-xs text-right hidden md:block">
              We focus on the fundamental pillars of a premium service space.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-stone-200">
            {[
              { icon: Truck, title: 'Expedited Delivery', desc: 'Global expedited shipping, resolving distance in 48 hours.' },
              { icon: ShieldCheck, title: 'Flawless Origin', desc: 'Each artifact undergoes rigorous inspection. 7-day unconditional returns.' },
              { icon: Headphones, title: 'Private Concierge', desc: 'Around the clock, dedicated advisors for your immediate needs.' },
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + (idx * 0.15) }}
                className="group relative p-12 border-r border-b border-stone-200 hover:bg-stone-50 transition-colors duration-500 flex flex-col h-full"
              >
                <div className="mb-16">
                  <feature.icon strokeWidth={1} className="w-10 h-10 text-ink/30 group-hover:text-ink transition-colors duration-500" />
                </div>
                <h3 className="font-serif text-2xl text-ink mb-4">{feature.title}</h3>
                <p className="font-light text-stone-500 leading-relaxed max-w-sm mt-auto text-sm">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-ink text-paper py-40 text-center relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-10 mix-blend-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-4xl mx-auto px-6"
        >
          <div className="w-px h-20 bg-paper/20 mx-auto mb-12"></div>
          <h2 className="font-serif text-5xl md:text-7xl font-normal text-paper mb-12 leading-tight">
            Ready to <br/><i className="text-stone-400">elevate</i> your collection?
          </h2>
          <Link
            href="/products"
            className="group relative inline-flex items-center justify-center px-12 py-6 bg-transparent text-paper text-sm tracking-[0.25em] uppercase hover:text-ink transition-colors duration-500 border border-paper overflow-hidden"
          >
            <span className="relative z-10">View The Catalog</span>
            <div className="absolute inset-0 bg-paper transform scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-500 ease-in-out z-0"></div>
          </Link>
        </motion.div>
      </section>
    </>
  );
}
