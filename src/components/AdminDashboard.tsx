import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useApp } from '../AppContext';
import { Header } from './Common';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, safeImage } from '../firebase';
import { Product, Order } from '../types';
import { CATEGORIES } from '../constants';

export const AdminDashboard: React.FC = () => {
  const { products, categories, banners, adminOrders, setScreen, deleteProduct, deleteCategory, fetchAllOrders, updateOrderStatus, t } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'categories' | 'banners'>('products');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const allOrders = (Object.values(adminOrders).flat() as Order[]).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="pb-24 bg-main-gradient min-h-screen">
      <Header title={t('adminDashboard')} showBack onBack={() => setScreen('profile')} />
      
      <div className="px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
            <span className="text-xs text-gray-400 block mb-1 uppercase font-black tracking-widest">{t('totalProducts')}</span>
            <span className="text-3xl font-black text-primary drop-shadow-sm">{products.length}</span>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
            <span className="text-xs text-gray-400 block mb-1 uppercase font-black tracking-widest">{t('totalOrders')}</span>
            <span className="text-3xl font-black text-accent drop-shadow-sm">{allOrders.length}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-3xl border border-gray-50 shadow-[0_6px_16px_rgba(0,0,0,0.12)] overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('products')}
            className={`flex-1 min-w-[110px] py-4 rounded-2xl text-sm font-black transition-all uppercase tracking-widest ${
              activeTab === 'products' ? 'bg-premium-gradient text-white shadow-glow' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t('products')}
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex-1 min-w-[110px] py-4 rounded-2xl text-sm font-black transition-all uppercase tracking-widest ${
              activeTab === 'orders' ? 'bg-premium-gradient text-white shadow-glow' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t('orders')}
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`flex-1 min-w-[110px] py-4 rounded-2xl text-sm font-black transition-all uppercase tracking-widest ${
              activeTab === 'categories' ? 'bg-premium-gradient text-white shadow-glow' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t('categories')}
          </button>
          <button 
            onClick={() => setActiveTab('banners')}
            className={`flex-1 min-w-[110px] py-4 rounded-2xl text-sm font-black transition-all uppercase tracking-widest ${
              activeTab === 'banners' ? 'bg-premium-gradient text-white shadow-glow' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t('banners')}
          </button>
        </div>

        {activeTab === 'products' ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{t('manageProducts')}</h3>
              <div className="flex gap-2">
                <select 
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <button 
                  onClick={() => {
                    setEditingProduct(null);
                    setShowForm(true);
                  }}
                  className="bg-premium-gradient text-white px-6 py-3 rounded-2xl text-sm font-black shadow-glow uppercase tracking-widest active:scale-95 transition-all"
                >
                  + {t('addProduct')}
                </button>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
                <p className="text-gray-400">{t('noProductsFound')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products
                  .filter(p => productCategoryFilter === 'all' || p.category === productCategoryFilter)
                  .map(product => (
                  <div key={product.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)] flex gap-4">
                    <img 
                      src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : (product.image || "https://via.placeholder.com/300")} 
                      className="w-16 h-16 rounded-xl object-cover" 
                      style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: "1",
                        visibility: "visible"
                      }}
                      alt={product.name} 
                      referrerPolicy="no-referrer" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/300";
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{product.name}</h4>
                      <p className="text-accent font-bold text-sm">${product.price}</p>
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => {
                            setEditingProduct(product);
                            setShowForm(true);
                          }}
                          className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-lg"
                        >
                          {t('edit')}
                        </button>
                        <button 
                          onClick={async () => {
                            try {
                              await deleteProduct(product.id);
                              toast.success('Product removed');
                            } catch (e) {
                              toast.error('Failed to remove product');
                            }
                          }}
                          className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg"
                        >
                          {t('remove')}
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{product.category}</span>
                      <p className="text-xs font-medium text-gray-500 mt-1">{t('stock')}: {product.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : activeTab === 'orders' ? (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">{t('manageOrders')}</h3>
            {allOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
                <p className="text-gray-400">{t('noOrdersFound')}</p>
              </div>
            ) : (
              allOrders.map(order => (
                <div key={order.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{t('orderNo')}{order.id.slice(-6)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.userId, order.id, e.target.value as any)}
                      className="text-[10px] font-bold uppercase tracking-wider bg-gray-50 border-none rounded-full px-3 py-1 focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="Order Placed">{t('orderPlaced')}</option>
                      <option value="Processing">{t('processingStatus')}</option>
                      <option value="Shipping">{t('shippingStatus')}</option>
                      <option value="Delivery">{t('deliveryStatus')}</option>
                      <option value="Delivered">{t('delivered')}</option>
                      <option value="Cancelled">{t('cancelledStatus')}</option>
                    </select>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={item.cartItemId || idx} className="flex justify-between text-xs">
                        <span className="text-gray-600">{item.name} x {item.quantity}</span>
                        <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                      {t('total')}: <span className="font-bold text-accent text-sm">${order.total.toFixed(2)}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      order.status === 'Delivered' ? 'bg-accent/10 text-accent' : 
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {order.status === 'Order Placed' ? t('orderPlaced') :
                       order.status === 'Processing' ? t('processingStatus') :
                       order.status === 'Shipping' ? t('shippingStatus') :
                       order.status === 'Delivery' ? t('deliveryStatus') :
                       order.status === 'Delivered' ? t('delivered') : 
                       order.status === 'Cancelled' ? t('cancelledStatus') : order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'categories' ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest">{t('manageCategories')}</h3>
              <button 
                onClick={() => setShowCategoryForm(true)}
                className="bg-premium-gradient text-white px-6 py-3 rounded-2xl text-sm font-black shadow-glow uppercase tracking-widest active:scale-95 transition-all"
              >
                + {t('addCategory')}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)] flex flex-col items-center gap-2 relative group">
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingCategory(cat);
                        setShowCategoryForm(true);
                      }}
                      className="p-1 bg-accent/10 text-accent rounded-lg"
                    >
                      <span className="text-[10px] font-bold">Edit</span>
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          await deleteCategory(cat.id);
                          toast.success('Category deleted');
                        } catch (e) {
                          toast.error('Failed to delete category');
                        }
                      }}
                      className="p-1 bg-red-50 text-red-600 rounded-lg"
                    >
                      <span className="text-[10px] font-bold">Delete</span>
                    </button>
                  </div>
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-100">
                    {cat.image ? (
                      <img src={cat.image} className="w-full h-full object-cover" alt={cat.name} referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-2xl">{cat.icon || '📦'}</span>
                    )}
                  </div>
                  <span className="font-bold text-gray-900">{cat.name}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest">{t('manageBanners')}</h3>
              <button 
                onClick={() => setShowBannerForm(true)}
                className="bg-premium-gradient text-white px-6 py-3 rounded-2xl text-sm font-black shadow-glow uppercase tracking-widest active:scale-95 transition-all"
              >
                + {t('addBanner')}
              </button>
            </div>
            <div className="space-y-4">
              {banners.map(banner => (
                <div key={banner.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)] flex gap-4">
                  <img src={banner.image || "https://via.placeholder.com/150"} className="w-24 h-16 rounded-xl object-cover" alt={banner.title} referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-bold text-gray-900">{banner.title}</h4>
                    <p className="text-xs text-gray-500">{banner.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showForm && (
        <ProductForm 
          onClose={() => setShowForm(false)} 
          initialData={editingProduct}
        />
      )}

      {showCategoryForm && (
        <CategoryForm 
          onClose={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }} 
          initialData={editingCategory}
        />
      )}

      {showBannerForm && (
        <BannerForm onClose={() => setShowBannerForm(false)} />
      )}
    </div>
  );
};

const CATEGORY_ICONS = ['📦', '🍎', '🥦', '🥩', '🥛', '🍞', '🥤', '🧼', '🧴', '🧹', '🐶', '👶', '🏠', '🛒', '🛍️', '🎁', '🔥', '✨', '🌿', '🍓', '🍋', '🥑', '🍗', '🍣', '🍕', '🍔', '🍦', '🍰', '☕', '🍷'];

const CategoryForm: React.FC<{ onClose: () => void; initialData?: any }> = ({ onClose, initialData }) => {
  const { addCategory, updateCategory, t } = useApp();
  const [name, setName] = useState(initialData?.name || '');
  const [icon, setIcon] = useState(initialData?.icon || '📦');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || '');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = initialData?.image || '';
      if (imageFile) {
        const uniqueName = `${Date.now()}_${imageFile.name}`;
        const storageRef = ref(storage, `categories/${uniqueName}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      if (initialData) {
        await updateCategory(initialData.id, { name, icon, image: imageUrl });
      } else {
        await addCategory({ name, icon, image: imageUrl });
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-[40px] p-8 max-h-[90vh] overflow-y-auto no-scrollbar">
        <h3 className="text-2xl font-black text-gray-900 mb-6">{initialData ? t('editCategory') : t('addCategory')}</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 relative flex items-center justify-center">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  className="w-full h-full object-cover" 
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: "1",
                    visibility: "visible"
                  }}
                  alt="Preview" 
                  referrerPolicy="no-referrer" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/300";
                  }}
                />
              ) : (
                <span className="text-3xl">{icon}</span>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-widest">Tap to upload image (optional)</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Category Name</label>
            <input required placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Select Icon</label>
            <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-xl no-scrollbar">
              {CATEGORY_ICONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`text-2xl p-2 rounded-lg transition-all ${icon === emoji ? 'bg-primary/20 scale-110' : 'hover:bg-gray-200'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-400">Selected:</span>
              <span className="text-2xl">{icon}</span>
              <input 
                placeholder="Custom" 
                value={icon} 
                onChange={e => setIcon(e.target.value)} 
                className="ml-auto w-16 px-2 py-1 bg-gray-50 rounded-lg text-center outline-none text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <button disabled={loading} className="w-full bg-premium-gradient text-white font-black py-5 rounded-3xl shadow-glow uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50">{loading ? '...' : (initialData ? t('save') : t('addCategory'))}</button>
            <button type="button" onClick={onClose} className="w-full text-gray-400 font-black py-4 uppercase tracking-widest text-sm">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const BannerForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addBanner, t } = useApp();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return;
    setLoading(true);
    const uniqueName = `${Date.now()}_${imageFile.name}`;
    const storageRef = ref(storage, `banners/${uniqueName}`);
    await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(storageRef);
    await addBanner({ title, subtitle, image: imageUrl });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-[40px] p-8">
        <h3 className="text-2xl font-black text-gray-900 mb-6">{t('addBanner')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none" />
          <input placeholder="Subtitle" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none" />
          <input required type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full" />
          <button disabled={loading} className="w-full bg-premium-gradient text-white font-black py-5 rounded-3xl shadow-glow uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50">{loading ? '...' : t('addBanner')}</button>
          <button type="button" onClick={onClose} className="w-full text-gray-400 font-black py-4 uppercase tracking-widest text-sm">Cancel</button>
        </form>
      </motion.div>
    </div>
  );
};

const ProductForm: React.FC<{ onClose: () => void; initialData: Product | null }> = ({ onClose, initialData }) => {
  const { addProduct, updateProduct, categories, t } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    price: initialData?.price || 0,
    category: initialData?.category || (categories.length > 0 ? categories[0].name : CATEGORIES[0].id),
    description: initialData?.description || '',
    stock: initialData?.stock || 0,
    rating: initialData?.rating || 4.5,
    trending: initialData?.trending || false,
    bestSeller: initialData?.bestSeller || false,
    featured: initialData?.featured || false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || '');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = initialData?.image || '';
      let images = initialData?.images || [];

      if (imageFile) {
        const uniqueName = `${Date.now()}_${imageFile.name}`;
        const storageRef = ref(storage, `products/${uniqueName}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
        images = [imageUrl]; // For now, we just support one image, but as a list
      }

      const productData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        rating: Number(formData.rating),
        image: imageUrl,
        images: images,
        createdAt: Date.now()
      };

      if (initialData) {
        await updateProduct(initialData.id, productData);
      } else {
        await addProduct(productData);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        className="bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-gray-900">{initialData ? t('editProduct') : t('addProduct')}</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 bg-gray-100 rounded-3xl overflow-hidden border-2 border-dashed border-gray-300 relative">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  className="w-full h-full object-cover" 
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: "1",
                    visibility: "visible"
                  }}
                  alt="Preview" 
                  referrerPolicy="no-referrer" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/300";
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">Tap to upload product image</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('productName')}</label>
              <input 
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('price')} ($)</label>
              <input 
                required
                type="number"
                step="0.01"
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('stock')}</label>
              <input 
                required
                type="number"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('category')}</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{t('description')}</label>
            <textarea 
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none h-24 resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.trending}
                onChange={e => setFormData({...formData, trending: e.target.checked})}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-sm font-medium text-gray-700">{t('trending')}</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.bestSeller}
                onChange={e => setFormData({...formData, bestSeller: e.target.checked})}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-sm font-medium text-gray-700">{t('bestSeller')}</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={formData.featured}
                onChange={e => setFormData({...formData, featured: e.target.checked})}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-sm font-medium text-gray-700">{t('featured')}</span>
            </label>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-premium-gradient text-white font-black py-5 rounded-3xl shadow-glow uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 mt-6"
          >
            {loading ? t('saving') : (initialData ? t('editProduct') : t('addProduct'))}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
