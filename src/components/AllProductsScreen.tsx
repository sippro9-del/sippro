import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useApp } from '../AppContext';
import { Header, BottomNav } from './Common';
import { ProductCard } from './HomeScreen';
import { CATEGORIES } from '../constants';

export const AllProductsScreen: React.FC = () => {
  const { products, setScreen, setSelectedProduct, addToCart, t } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'rating' | 'name'>('rating');
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [attributes, setAttributes] = useState({
    organic: false,
    glutenFree: false,
    vegan: false
  });

  const resetFilters = () => {
    setPriceRange([0, 1000]);
    setMinRating(0);
    setInStockOnly(false);
    setAttributes({
      organic: false,
      glutenFree: false,
      vegan: false
    });
    setActiveCategory('all');
  };

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || p.category?.toLowerCase().trim() === activeCategory?.toLowerCase().trim();
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchesRating = (p.rating || 0) >= minRating;
      const matchesStock = !inStockOnly || (p.stock || 0) > 0;
      const matchesOrganic = !attributes.organic || p.isOrganic;
      const matchesGlutenFree = !attributes.glutenFree || p.isGlutenFree;
      const matchesVegan = !attributes.vegan || p.isVegan;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesStock && matchesOrganic && matchesGlutenFree && matchesVegan;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="pb-24 md:pb-12 bg-main-gradient min-h-screen bg-section-depth">
      <Header 
        title={t('allProducts')} 
        showBack 
        onBack={() => setScreen('home')} 
        showSearch 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
      />
      
      <div className="w-full px-2 md:px-4">
        <div className="px-2 py-4 md:py-6 bg-white sticky top-[110px] md:top-[120px] z-40 border-b border-gray-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
          <div className="flex flex-col md:flex-row gap-4 mb-4 md:items-center">
            <div className="relative flex-1">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-4 pr-10 py-3 md:py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-primary outline-none text-sm md:text-base font-bold text-gray-700 appearance-none transition-all"
              >
                <option value="rating">{t('sortBy')}: {t('rating')}</option>
                <option value="price-low">{t('sortBy')}: {t('priceLow')}</option>
                <option value="price-high">{t('sortBy')}: {t('priceHigh')}</option>
                <option value="name">{t('sortBy')}: {t('name')}</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</span>
            </div>
            <button 
              onClick={() => setShowFilters(true)}
              className="bg-white p-4 md:px-8 md:py-5 rounded-2xl text-primary active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-primary/5 border-2 border-primary/10 shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
            >
              <SlidersHorizontal size={20} />
              <span className="text-sm md:text-xl font-bold">{t('filter')}</span>
            </button>
          </div>
          
          <div className="flex overflow-x-auto gap-2 no-scrollbar py-1">
            <button 
              onClick={() => setActiveCategory('all')}
              className={`px-6 py-3 md:px-10 md:py-5 rounded-full text-xs md:text-lg font-bold transition-all whitespace-nowrap ${activeCategory === 'all' ? 'bg-primary text-white shadow-[0_4px_10px_rgba(249,115,22,0.3)]' : 'bg-white border-2 border-orange-50 text-gray-500 hover:bg-orange-50 shadow-sm'}`}
            >
              {t('all')}
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-3 md:px-10 md:py-5 rounded-full text-xs md:text-lg font-bold transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-primary text-white shadow-[0_4px_10px_rgba(249,115,22,0.3)]' : 'bg-white border-2 border-orange-50 text-gray-500 hover:bg-orange-50 shadow-sm'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="py-6 md:py-10">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 md:py-32 bg-white rounded-3xl border border-gray-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
              <span className="text-6xl md:text-8xl block mb-4">🔍</span>
              <h3 className="text-xl md:text-3xl font-bold text-gray-900">{t('noProductsFound')}</h3>
              <p className="text-gray-500 mt-2 md:text-lg">{t('tryAdjustingFilters')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-[10px] md:gap-[14px]">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onSelect={() => {
                    setSelectedProduct(product);
                    setScreen('product-details');
                  }}
                  onAdd={() => addToCart(product)}
                  fullWidth
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav active="home" onNavigate={setScreen} />
    </div>
  );
};
