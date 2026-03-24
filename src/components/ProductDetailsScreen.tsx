import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../AppContext';
import { Header } from './Common';
import { Review, ProductVariant } from '../types';
import { safeImage } from '../firebase';

export const ProductDetailsScreen: React.FC = () => {
  const { selectedProduct, selectedProductReviews, setScreen, addToCart, t, toggleWishlist, isInWishlist, submitReview, user } = useApp();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    selectedProduct?.variants && selectedProduct.variants.length > 0 ? selectedProduct.variants[0] : undefined
  );

  if (!selectedProduct) {
    setScreen('home');
    return null;
  }

  // 1. Log product before rendering
  console.log("PRODUCT DETAILS:", selectedProduct);

  // 6. Check if product.images is actually array
  const imagesArray = Array.isArray(selectedProduct.images) ? selectedProduct.images : (selectedProduct.image ? [selectedProduct.image] : []);
  
  const productImages = imagesArray.length > 0
    ? imagesArray 
    : ["https://via.placeholder.com/300"];

  // 2. Log image URL
  console.log("IMAGE URLS:", productImages);

  const isWishlisted = isInWishlist(selectedProduct.id);
  const currentPrice = selectedVariant ? selectedVariant.price : selectedProduct.price;
  const currentStock = selectedVariant ? selectedVariant.stock : selectedProduct.stock;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setScreen('auth');
      return;
    }
    if (!reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await submitReview(selectedProduct.id, reviewRating, reviewComment);
      setReviewComment('');
      setReviewRating(5);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert(t('productShared'));
    });
  };

  const reviews = selectedProductReviews;

  return (
    <div className="pb-32 md:pb-20 bg-main-gradient min-h-screen">
      <Header showBack onBack={() => setScreen('home')} title={t('productDetails')} />
      
      <div className="max-w-7xl mx-auto md:flex md:gap-16 md:px-8 md:py-16">
        {/* Image Carousel */}
        <div className="relative aspect-square w-full md:w-1/2 bg-gray-50 overflow-hidden md:rounded-3xl md:shadow-lg md:sticky md:top-32 h-fit">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={productImages[currentImageIndex] || "https://via.placeholder.com/300"} 
              alt={selectedProduct.name} 
              className="w-full h-full object-cover"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: "1",
                visibility: "visible"
              }}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/300";
              }}
            />
          </AnimatePresence>
          
          {productImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
              {productImages.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all ${idx === currentImageIndex ? 'bg-primary w-6' : 'bg-white/50 backdrop-blur-sm'}`}
                />
              ))}
            </div>
          )}

          <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg">
            <span className="text-primary font-bold text-2xl md:text-3xl lg:text-4xl">₹{(currentPrice || 0).toFixed(2)}</span>
          </div>

          <button 
            onClick={handleShare}
            className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-md text-gray-400 hover:text-primary active:scale-95 transition-all"
          >
            <span className="text-xl">🔗</span>
          </button>
        </div>

        <div className="px-6 py-10 md:px-0 md:py-0 md:flex-1">
          <div className="flex justify-between items-start mb-6 md:mb-10">
            <div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">{selectedProduct.name || 'Unnamed Product'}</h2>
              <div className="flex items-center gap-3 mt-4 md:mt-6">
                <div className="flex text-accent text-xl md:text-2xl">
                  {'★'.repeat(Math.floor(selectedProduct.rating || 0))}
                  <span className="text-gray-200">{'★'.repeat(5 - Math.floor(selectedProduct.rating || 0))}</span>
                </div>
                <span className="text-base md:text-lg font-bold text-gray-500">({selectedProduct.rating || 0})</span>
                {currentStock <= 5 && currentStock > 0 && (
                  <span className="text-[10px] md:text-sm font-bold text-accent bg-accent/5 px-3 py-1 md:px-4 md:py-1.5 rounded-full uppercase tracking-wider ml-3">
                    Only {currentStock} left!
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={() => toggleWishlist(selectedProduct.id)}
              className={`p-3 md:p-4 rounded-2xl shadow-md transition-all ${isWishlisted ? 'bg-accent text-white' : 'bg-white text-gray-400 hover:text-accent'} active:scale-95`}
            >
              <svg className="w-6 h-6 md:w-8 md:h-8" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Variants Selection */}
          {selectedProduct.variants && selectedProduct.variants.length > 0 && (
            <div className="mb-10 md:mb-16">
              <h4 className="font-bold text-gray-900 mb-4 md:text-xl">{t('selectVariant')}</h4>
              <div className="flex flex-wrap gap-4">
                {selectedProduct.variants.map(variant => (
                  <button 
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-6 py-4 md:px-8 md:py-5 rounded-2xl text-sm md:text-lg font-bold border-2 transition-all ${selectedVariant?.id === variant.id ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-10 md:mb-16">
            <h4 className="font-bold text-gray-900 mb-3 md:text-xl">{t('description')}</h4>
            <p className="text-gray-500 leading-relaxed text-base md:text-xl lg:text-2xl font-medium">
              {selectedProduct.description || 'No description available for this product.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-8 mb-10 md:mb-16">
            <div className="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
              <span className="text-xs md:text-base text-gray-400 block mb-2">{t('category')}</span>
              <span className="font-bold text-gray-900 text-base md:text-2xl capitalize">{selectedProduct.category}</span>
            </div>
            <div className="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
              <span className="text-xs md:text-base text-gray-400 block mb-2">{t('origin')}</span>
              <span className="font-bold text-gray-900 text-base md:text-2xl">Organic Farm</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-3 md:gap-4 flex-wrap mb-10 md:mb-16">
            {selectedProduct.isOrganic && <span className="px-4 py-2 md:px-6 md:py-3 bg-green-50 text-green-600 text-[10px] md:text-sm font-bold rounded-xl uppercase tracking-wider border border-green-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">🌿 {t('organic')}</span>}
            {selectedProduct.isGlutenFree && <span className="px-4 py-2 md:px-6 md:py-3 bg-blue-50 text-blue-600 text-[10px] md:text-sm font-bold rounded-xl uppercase tracking-wider border border-blue-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">🌾 {t('glutenFree')}</span>}
            {selectedProduct.isVegan && <span className="px-4 py-2 md:px-6 md:py-3 bg-accent/5 text-accent text-[10px] md:text-sm font-bold rounded-xl uppercase tracking-wider border border-accent/10 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">🥕 {t('vegan')}</span>}
          </div>

          {/* Reviews Section */}
          <div className="mb-12">
            <h4 className="font-bold text-gray-900 mb-6 md:text-2xl">{t('reviews')}</h4>
            
            {/* Review Form */}
            <form onSubmit={handleReviewSubmit} className="bg-white p-6 md:p-10 rounded-3xl border border-gray-100 mb-10 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
              <p className="text-xs md:text-base font-bold text-gray-500 mb-3">{t('writeReview')}</p>
              <div className="flex gap-3 mb-5">
                {[1, 2, 3, 4, 5].map(r => (
                  <button 
                    key={r}
                    type="button"
                    onClick={() => setReviewRating(r)}
                    className={`text-2xl md:text-4xl transition-all hover:scale-110 ${r <= reviewRating ? 'text-accent' : 'text-gray-200'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea 
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full p-4 md:p-6 bg-gray-50 rounded-2xl border border-gray-100 outline-none text-sm md:text-lg min-h-[100px] md:min-h-[160px] focus:ring-2 focus:ring-primary transition-all"
              />
              <button 
                type="submit"
                disabled={isSubmittingReview}
                className="mt-6 w-full bg-primary text-white py-4 md:py-6 rounded-xl text-sm md:text-lg font-bold shadow-[0_4px_10px_rgba(249,115,22,0.3)] active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmittingReview ? t('saving') : t('submitReview')}
              </button>
            </form>

            {/* Reviews List */}
            <div className="space-y-6 md:space-y-12">
              {reviews.length === 0 ? (
                <p className="text-sm md:text-xl text-gray-400 text-center py-8 italic">{t('noReviews')}</p>
              ) : (
                reviews.sort((a, b) => b.createdAt - a.createdAt).map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 md:pb-12 last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-base md:text-2xl text-gray-900">{review.userName}</span>
                      <div className="flex text-accent text-sm md:text-xl">
                        {'★'.repeat(review.rating)}
                      </div>
                    </div>
                    <p className="text-sm md:text-lg text-gray-500 leading-relaxed font-medium">{review.comment}</p>
                    <span className="text-[10px] md:text-sm text-gray-300 mt-2 block font-bold uppercase tracking-wider">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 md:px-12 md:py-8 flex gap-4 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.2)]">
        <div className="max-w-7xl mx-auto w-full flex gap-4 md:gap-8">
          <button 
            onClick={() => addToCart(selectedProduct, selectedVariant)}
            className="flex-1 bg-white border-2 border-secondary text-secondary font-bold py-4 md:py-6 rounded-2xl active:scale-95 transition-all text-sm md:text-xl shadow-[0_4px_10px_rgba(249,115,22,0.3)] hover:bg-orange-50"
          >
            {t('addToCart')}
          </button>
          <button 
            onClick={() => {
              addToCart(selectedProduct, selectedVariant);
              setScreen('cart');
            }}
            className="flex-1 bg-primary text-white font-bold py-4 md:py-6 rounded-2xl shadow-[0_4px_10px_rgba(249,115,22,0.3)] active:scale-95 transition-all text-sm md:text-xl"
          >
            {t('buyNow')}
          </button>
        </div>
      </div>
    </div>
  );
};
