import { useEffect, useState } from "react";
import { useApp } from "../AppContext";
import { motion } from "motion/react";
import { safeImage } from "../firebase";

export default function Banner() {
  const { banners, loading: contextLoading } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // High-quality vibrant Indian spices image
  const defaultBannerImage = "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=2000";
  
  const displayBanners = banners.length > 0 ? banners : [
    {
      id: 'default-1',
      title: 'Shivam Spices',
      subtitle: 'Authentic Indian Flavors',
      image: defaultBannerImage
    }
  ];

  useEffect(() => {
    if (displayBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [displayBanners.length]);

  if (contextLoading && banners.length === 0) return (
    <div className="w-full h-56 md:h-80 lg:h-[450px] bg-gray-100 animate-pulse rounded-[20px] flex items-center justify-center">
      <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest">Loading banners...</p>
    </div>
  );

  return (
    <div className="relative overflow-hidden rounded-[20px] shadow-xl group">
      <div 
        className="relative h-56 md:h-80 lg:h-[450px] flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {displayBanners.map((banner, index) => (
          <div key={banner.id || index} className="min-w-full h-full relative flex-shrink-0">
            <img
              src={banner.images?.[0] || banner.image || defaultBannerImage}
              alt={banner.title || "banner"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block"
              }}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultBannerImage;
              }}
            />
            
            {/* Soft dark gradient overlay from left to right (black with 50% opacity fading to transparent) */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent z-10" />
            
            {/* Banner Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 lg:px-24 z-20">
              <div className="max-w-xl">
                <motion.h2 
                  key={`title-${currentIndex}`}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="text-white text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight"
                >
                  {banner.title || 'Shivam Spices'}
                </motion.h2>
                
                <motion.p 
                  key={`subtitle-${currentIndex}`}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  className="text-white/80 text-sm md:text-xl lg:text-2xl font-medium mt-2 md:mt-4"
                >
                  {banner.subtitle || 'Authentic Indian Flavors'}
                </motion.p>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                >
                  <button 
                    onClick={() => {
                      const element = document.getElementById('products-section');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="mt-6 md:mt-10 bg-gradient-to-r from-[#ff7a18] to-[#ff4d00] text-white text-sm md:text-lg font-bold px-8 py-3 md:px-12 md:py-4 rounded-full shadow-lg hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    Shop Now
                  </button>
                </motion.div>
              </div>
            </div>

            {/* 59% OFF Badge */}
            <div className="absolute top-4 right-4 md:top-8 md:right-8 z-30">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-[#ff4d00] text-white font-black px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-lg shadow-xl border-2 border-white/20"
              >
                59% OFF
              </motion.div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Dots indicator */}
      {displayBanners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {displayBanners.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 md:h-2.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-10 md:w-12 bg-white shadow-glow' : 'w-2 md:w-2.5 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
