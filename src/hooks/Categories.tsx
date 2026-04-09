import { useState } from "react";
import { motion } from "motion/react";
import { useApp } from "../AppContext";
import { Category } from "../types";

function CategoryIcon({ cat }: { cat: Category }) {
  const [imageError, setImageError] = useState(false);

  if (cat.image && !imageError) {
    return (
      <img 
        src={cat.image} 
        alt={cat.name} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        referrerPolicy="no-referrer"
        onError={() => setImageError(true)}
      />
    );
  }

  return <span className="text-3xl md:text-4xl transform transition-transform duration-500 group-hover:scale-110">{cat.icon || '📦'}</span>;
}

export default function Categories() {
  const { t, selectedCategory, setSelectedCategory, categories, loading: contextLoading, setActiveSection } = useApp();

  if (contextLoading && categories.length === 0) return (
    <div className="flex px-4 gap-6 md:gap-10 overflow-x-auto no-scrollbar py-8 md:justify-center">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="min-w-[80px] md:min-w-[120px] flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-[2.5rem] bg-gray-100 shadow-inner" />
          <div className="w-12 h-3 bg-gray-100 rounded-full" />
        </div>
      ))}
    </div>
  );

  if (categories.length === 0) return null;

  const handleCategoryClick = (catName: string | null) => {
    setSelectedCategory(catName);
    setActiveSection('all');
    // Scroll to products section
    const element = document.getElementById('products-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-8 md:py-16 bg-gradient-to-b from-white to-gray-50/30">
      <div className="flex items-center justify-between px-6 mb-8 md:mb-12 max-w-7xl mx-auto">
        <div className="flex flex-col gap-1">
          <h4 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter">{t('categories')}</h4>
          <div className="h-1.5 w-12 bg-primary rounded-full" />
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-100 to-transparent ml-8 hidden md:block" />
      </div>
      
      <div className="flex overflow-x-auto px-6 gap-6 md:gap-12 no-scrollbar pb-6 md:justify-center max-w-7xl mx-auto">
        {/* "All" category option */}
        <motion.div 
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleCategoryClick(null)}
          className="flex flex-col items-center gap-4 min-w-[90px] md:min-w-[130px] group cursor-pointer"
        >
          <div className={`w-20 h-20 md:w-28 md:h-28 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 transform group-hover:rotate-3 relative overflow-hidden ${!selectedCategory ? 'bg-warm-gradient text-white shadow-xl shadow-primary/20 scale-105' : 'bg-white text-primary border border-gray-100 shadow-lg hover:border-primary/30'}`}>
            {!selectedCategory && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-30"
              />
            )}
            <span className="text-4xl md:text-5xl relative z-10">✨</span>
          </div>
          <span className={`text-sm md:text-lg font-black tracking-tight transition-all duration-300 ${!selectedCategory ? 'text-primary scale-110' : 'text-gray-500 group-hover:text-primary'}`}>{t('all')}</span>
        </motion.div>

        {categories.map(cat => {
          const isActive = selectedCategory?.toLowerCase().trim() === cat.name.toLowerCase().trim();
          return (
            <motion.div 
              key={cat.id}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryClick(cat.name)}
              className="flex flex-col items-center gap-4 min-w-[90px] md:min-w-[130px] group cursor-pointer"
            >
              <div className={`w-20 h-20 md:w-28 md:h-28 rounded-[2.5rem] flex items-center justify-center overflow-hidden transition-all duration-500 transform group-hover:-rotate-3 relative ${isActive ? 'bg-warm-gradient text-white shadow-xl shadow-primary/20 scale-105' : 'bg-white text-secondary border border-gray-100 shadow-lg hover:border-primary/30'}`}>
                {isActive && (
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-bl from-white/20 to-transparent opacity-30"
                  />
                )}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <CategoryIcon cat={cat} />
                </div>
              </div>
              <span className={`text-sm md:text-lg font-black tracking-tight transition-all duration-300 text-center ${isActive ? 'text-primary scale-110' : 'text-gray-500 group-hover:text-primary'}`}>{cat.name}</span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
