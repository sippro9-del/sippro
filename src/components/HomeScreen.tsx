import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../AppContext';
import { Header, BottomNav } from './Common';
import { CATEGORIES } from '../constants';
import { Product } from '../types';
import { safeImage } from '../firebase';
import { Star } from 'lucide-react';
import Banner from './Banner';
import Categories from '../hooks/Categories';

export const HomeScreen: React.FC = () => {
  const { products: contextProducts, productsLoaded, setScreen, setSelectedProduct, addToCart, t, selectedCategory, setSelectedCategory } = useApp();
  
  console.log(">>> [FLOW] 5. HomeScreen render. Context products count:", contextProducts?.length, "Loaded:", productsLoaded);

  const [searchQuery, setSearchQuery] = useState('');

  const [activeSection, setActiveSection] = useState<'all' | 'trending' | 'best-seller'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'rating' | 'name'>('rating');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [minRating, setMinRating] = useState(0);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [isOrganic, setIsOrganic] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isVegan, setIsVegan] = useState(false);

  const filteredProducts = (contextProducts || [])
    .filter(p => {
      const name = p?.name || '';
      const category = p?.category || '';
      const search = searchQuery.toLowerCase();
      
      const matchesSearch = name.toLowerCase().includes(search) || 
                           category.toLowerCase().includes(search);
      
      const matchesSection = 
        activeSection === 'all' ? true :
        activeSection === 'trending' ? p?.trending === true :
        activeSection === 'best-seller' ? p?.bestSeller === true : true;
      
      const matchesCategory = selectedCategory 
        ? p?.category?.toLowerCase().trim() === selectedCategory?.toLowerCase().trim() 
        : true;
      
      const price = p?.price || 0;
      const rating = p?.rating || 0;
      const stock = p?.stock || 0;

      const matchesPrice = price >= priceRange.min && price <= priceRange.max;
      const matchesRating = rating >= minRating;
      const matchesStock = onlyInStock ? stock > 0 : true;
      const matchesOrganic = isOrganic ? p?.isOrganic === true : true;
      const matchesGlutenFree = isGlutenFree ? p?.isGlutenFree === true : true;
      const matchesVegan = isVegan ? p?.isVegan === true : true;
      
      const isMatch = matchesSearch && matchesSection && matchesCategory && matchesPrice && matchesRating && matchesStock && matchesOrganic && matchesGlutenFree && matchesVegan;
      
      if (!isMatch && contextProducts.length > 0 && contextProducts.length < 10) {
        console.log(`>>> [DEBUG] Product ${p.id} (${p.name}) filtered out:`, {
          matchesSearch, matchesSection, matchesCategory, matchesPrice, matchesRating, matchesStock, matchesOrganic, matchesGlutenFree, matchesVegan
        });
      }

      return isMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return (a?.price || 0) - (b?.price || 0);
      if (sortBy === 'price-high') return (b?.price || 0) - (a?.price || 0);
      if (sortBy === 'rating') return (b?.rating || 0) - (a?.rating || 0);
      if (sortBy === 'name') return (a?.name || '').localeCompare(b?.name || '');
      return 0;
    });

  const featuredProducts = (contextProducts || []).filter(p => p?.featured);

  // Minimal log for debugging
  useEffect(() => {
    console.log(">>> [FLOW] 6. HomeScreen state check. Context products:", contextProducts?.length, "Filtered products:", filteredProducts?.length);
    if (contextProducts && contextProducts.length > 0) {
      console.log(">>> [FLOW] 6a. Sample product:", contextProducts[0]);
    }
  }, [contextProducts, filteredProducts]);

  return (
    <div className="pb-24 bg-main-gradient min-h-screen relative">
      <Header 
        showSearch 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
      />
      
      <div className="w-full px-2 md:px-4">
        {/* Sorting & Advanced Filter Toggle */}
        <div className="px-4 py-4 md:py-6 bg-white/80 backdrop-blur-md flex gap-3 sticky top-[80px] md:top-[100px] z-40 border-b border-gray-100 shadow-sm">
          <div className="relative flex-1 max-w-xs group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-12 pr-10 py-3.5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none text-sm md:text-base font-black text-gray-700 appearance-none transition-all cursor-pointer shadow-inner"
            >
              <option value="rating">⭐ {t('ratingSort')}</option>
              <option value="price-low">📉 {t('priceLow')}</option>
              <option value="price-high">📈 {t('priceHigh')}</option>
              <option value="name">🔤 {t('nameSort')}</option>
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3.5 md:px-8 rounded-2xl transition-all flex items-center gap-2 shadow-lg active:scale-95 border-2 ${showFilters ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-white text-gray-700 border-gray-100 hover:border-primary/20 hover:bg-gray-50'}`}
          >
            <span className="text-xl">⚙️</span>
            <span className="text-sm font-black hidden sm:inline tracking-tight">{t('filters')}</span>
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-4 py-4 md:py-8 bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="flex flex-col gap-6 max-w-4xl mx-auto">
              <div className="flex justify-between items-center">
                <h5 className="font-bold text-sm md:text-lg text-gray-900">{t('filters')}</h5>
                <button 
                  onClick={() => {
                    setPriceRange({ min: 0, max: 1000 });
                    setMinRating(0);
                    setOnlyInStock(false);
                  }}
                  className="text-xs md:text-sm text-primary font-bold hover:underline"
                >
                  Reset
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Price Range */}
                <div>
                  <p className="text-xs md:text-sm font-bold text-gray-500 mb-3">{t('priceRange')} (₹{priceRange.min} - ₹{priceRange.max})</p>
                  <input 
                    type="range" 
                    min="0" 
                    max="1000" 
                    value={priceRange.max} 
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>

                {/* Rating */}
                <div>
                  <p className="text-xs md:text-sm font-bold text-gray-500 mb-3">{t('rating')} (Min: {minRating} ⭐)</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(r => (
                      <button 
                        key={r}
                        onClick={() => setMinRating(r)}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-xs md:text-sm font-bold transition-all ${minRating === r ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="flex items-center justify-between md:justify-start md:gap-8">
                  <p className="text-xs md:text-sm font-bold text-gray-500">{t('inStock')}</p>
                  <button 
                    onClick={() => setOnlyInStock(!onlyInStock)}
                    className={`w-12 h-6 md:w-14 md:h-7 rounded-full transition-all relative ${onlyInStock ? 'bg-primary' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full transition-all ${onlyInStock ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              {/* Granular Filters */}
              <div className="flex gap-2 md:gap-4 flex-wrap">
                <FilterTag 
                  label={t('organic')} 
                  active={isOrganic} 
                  onClick={() => setIsOrganic(!isOrganic)} 
                />
                <FilterTag 
                  label={t('glutenFree')} 
                  active={isGlutenFree} 
                  onClick={() => setIsGlutenFree(!isGlutenFree)} 
                />
                <FilterTag 
                  label={t('vegan')} 
                  active={isVegan} 
                  onClick={() => setIsVegan(!isVegan)} 
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Banner Slider Section */}
        <div className="py-2 md:py-4">
          <Banner />
        </div>

        {/* Categories */}
        <div className="bg-section-depth rounded-3xl my-1">
          <Categories />
        </div>

        {/* Section Tabs */}
        <div className="py-2 md:py-4 flex gap-3 md:gap-6 overflow-x-auto no-scrollbar max-w-7xl mx-auto px-4">
          <button 
            onClick={() => setActiveSection('all')}
            className={`px-8 py-3 md:px-12 md:py-4 rounded-2xl text-sm md:text-base font-black transition-all whitespace-nowrap border-2 ${activeSection === 'all' ? 'bg-primary text-white border-primary shadow-[0_12px_24px_rgba(249,115,22,0.3)]' : 'bg-white text-gray-500 border-gray-100 hover:border-primary/20 hover:bg-gray-50 shadow-sm'}`}
          >
            {t('viewAll')}
          </button>
          <button 
            onClick={() => setActiveSection('trending')}
            className={`px-8 py-3 md:px-12 md:py-4 rounded-2xl text-sm md:text-base font-black transition-all whitespace-nowrap border-2 ${activeSection === 'trending' ? 'bg-primary text-white border-primary shadow-[0_12px_24px_rgba(249,115,22,0.3)]' : 'bg-white text-gray-500 border-gray-100 hover:border-primary/20 hover:bg-gray-50 shadow-sm'}`}
          >
            {t('trending')}
          </button>
          <button 
            onClick={() => setActiveSection('best-seller')}
            className={`px-8 py-3 md:px-12 md:py-4 rounded-2xl text-sm md:text-base font-black transition-all whitespace-nowrap border-2 ${activeSection === 'best-seller' ? 'bg-primary text-white border-primary shadow-[0_12px_24px_rgba(249,115,22,0.3)]' : 'bg-white text-gray-500 border-gray-100 hover:border-primary/20 hover:bg-gray-50 shadow-sm'}`}
          >
            {t('bestSellers')}
          </button>
        </div>

        {!productsLoaded ? (
          <div className="py-12 md:py-24 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
            <p className="text-gray-500 font-bold animate-pulse">{t('loadingProducts') || 'Loading Products...'}</p>
          </div>
        ) : contextProducts.length === 0 ? (
          <div className="py-4 md:py-8 text-center">
            <span className="text-6xl md:text-8xl block mb-4">🍃</span>
            <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">{t('noProducts')}</h3>
            <p className="text-gray-500 md:text-lg">{t('checkBackLater')}</p>
          </div>
        ) : (
          <div id="products-section" className="py-2 md:py-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-4 md:py-8 bg-white rounded-3xl border border-dashed border-gray-200">
                <span className="text-4xl md:text-6xl block mb-2">🔍</span>
                <h4 className="font-bold text-gray-900 md:text-xl mb-1">{t('noProductsFound')}</h4>
                <p className="text-xs md:text-sm text-gray-500">{t('noProductsFoundSubtitle')}</p>
              </div>
            ) : (
              <>
                {/* If we are in 'all' section and no category/search filter, show featured first */}
                {activeSection === 'all' && searchQuery === '' && featuredProducts.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg md:text-2xl font-bold text-gray-900 mb-4">{t('featuredSelection')}</h4>
                    <div className="flex overflow-x-auto gap-3 md:gap-4 no-scrollbar pb-2">
                      {featuredProducts.map((product) => (
                        <ProductCard 
                          key={product.id} 
                          product={product} 
                          onSelect={() => {
                            setSelectedProduct(product);
                            setScreen('product-details');
                          }}
                          onAdd={() => addToCart(product)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <h4 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 capitalize">
                  {activeSection === 'all' ? t('ourCollection') : t(activeSection === 'trending' ? 'trending' : 'bestSellers')}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-6">
                  {filteredProducts && filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      console.log(">>> [FLOW] 7. Rendering ProductCard for:", product.id, product.name);
                      return (
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
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-12 md:py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                      <span className="text-4xl md:text-6xl block mb-4">🔍</span>
                      <h4 className="font-bold text-gray-900 md:text-xl mb-1">{t('noProductsFound')}</h4>
                      <p className="text-xs md:text-sm text-gray-500">{t('noProductsFoundSubtitle')}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <BottomNav active="home" onNavigate={setScreen} />
    </div>
  );
};

const FilterTag: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 md:px-6 md:py-3 rounded-xl text-[10px] md:text-xs font-bold transition-all border ${active ? 'bg-primary text-white border-primary shadow-md shadow-primary/10' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
  >
    {label}
  </button>
);

export const ProductCard: React.FC<{ product: Product; onSelect: () => void; onAdd: () => void; fullWidth?: boolean }> = ({ product, onSelect, onAdd, fullWidth }) => {
  const { t, toggleWishlist, isInWishlist } = useApp();
  const isWishlisted = isInWishlist(product.id);
  const [isAdding, setIsAdding] = useState(false);

  // 1. Log each product before rendering
  console.log("PRODUCT:", product);

  // 2. Log image URL
  console.log("IMAGE URL:", product?.images?.[0] || product?.image);

  // 6. Check if product.images is actually array
  const imagesArray = Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []);
  
  // 4. Robust image URL resolution
  const imageUrl = imagesArray[0] || product?.image || "https://via.placeholder.com/300";

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    await onAdd();
    setTimeout(() => setIsAdding(false), 1000);
  };

  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white rounded-3xl p-3 md:p-4 shadow-[0_6px_16px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col relative transition-all ${fullWidth ? 'w-full' : 'w-44 md:w-64'}`}
    >
      <button 
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        className={`absolute top-4 left-4 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-md transition-all ${isWishlisted ? 'bg-accent text-white' : 'bg-white/90 text-gray-400 hover:text-accent'}`}
      >
        {isWishlisted ? '❤️' : '🤍'}
      </button>

      {discount > 0 && (
        <div className="absolute top-4 right-4 z-10 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-lg">
          {discount}% OFF
        </div>
      )}

      <div onClick={onSelect} className="relative rounded-2xl mb-4 bg-gray-50 cursor-pointer group" style={{ display: "block", opacity: 1 }}>
        {/* 5. Ensure no conditional rendering is blocking. Always render img. */}
        <img 
          src={imageUrl} 
          alt="product" 
          className="w-full object-cover transition-transform duration-500 group-hover:scale-105" 
          style={{ 
            width: "100%",
            height: "200px",
            objectFit: "cover",
            display: "block",
            borderRadius: "10px",
            opacity: "1",
            visibility: "visible"
          }} 
          referrerPolicy="no-referrer"
          onLoad={() => console.log(`>>> [FLOW] 8. Image loaded successfully for: ${product.name}`)}
          onError={(e) => {
            console.warn(`>>> [FLOW] 8-ERROR. Image failed to load for: ${product.name}, URL: ${imageUrl}`);
            (e.target as HTMLImageElement).src = "https://via.placeholder.com/300";
          }}
        />
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-[10px] md:text-xs font-bold text-gray-900">{product.rating}</span>
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 bg-accent text-white text-[9px] font-bold px-2 py-1 rounded-md">
            {t('lowStock')}
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-gray-900 text-[10px] md:text-xs font-bold px-4 py-2 rounded-xl">
              {t('outOfStock')}
            </span>
          </div>
        )}
      </div>

      <div onClick={onSelect} className="flex-1 cursor-pointer">
        <h5 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1 mb-1">{product.name || 'Unnamed Product'}</h5>
        <p className="text-[10px] md:text-xs text-gray-500 line-clamp-2 mb-2">{product.description || 'No description available'}</p>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <p className="font-bold text-lg text-primary">₹{(product.price || 0).toFixed(2)}</p>
            {product.oldPrice && (
              <p className="text-xs text-gray-400 line-through">₹{(product.oldPrice || 0).toFixed(2)}</p>
            )}
          </div>
          <p className="text-[10px] text-gray-400">{t('stock')}: {product.stock ?? 0}</p>
        </div>
      </div>

      <button 
        onClick={handleQuickAdd}
        disabled={product.stock === 0 || isAdding}
        className={`mt-4 w-full py-3 md:py-4 rounded-xl flex items-center justify-center transition-all font-bold text-xs md:text-sm shadow-[0_4px_10px_rgba(249,115,22,0.3)] active:scale-95 ${
          isAdding 
          ? 'bg-green-500 text-white' 
          : 'bg-secondary text-white hover:bg-primary disabled:bg-gray-200 disabled:shadow-none'
        }`}
      >
        {isAdding ? `✅ ${t('added')}` : `🛒 ${t('addToCart')}`}
      </button>
    </motion.div>
  );
};
