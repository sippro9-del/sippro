import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithRedirect, 
  getRedirectResult,
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  collection, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  limit,
  getDocFromServer,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider } from './firebase';
import { CartItem, Product, Order, UserProfile, Screen, OrderStatus, ProductVariant, Coupon, NotificationPreferences, Banner, Category, Review } from './types';
import { Language, translations } from './translations';

const MOCK_COUPONS: Coupon[] = [
  { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minPurchase: 50, expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000, isActive: true },
  { code: 'SPICE20', discountType: 'fixed', discountValue: 20, minPurchase: 100, expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000, isActive: true },
];

interface AppContextType {
  user: User | null;
  profile: UserProfile | null;
  products: Product[];
  categories: Category[];
  banners: Banner[];
  cart: CartItem[];
  orders: Order[];
  adminOrders: { [userId: string]: Order[] };
  currentScreen: Screen;
  selectedProduct: Product | null;
  setSelectedProductReviews: (reviews: Review[]) => void;
  selectedProductReviews: Review[];
  selectedCategory: string | null;
  loading: boolean;
  productsLoaded: boolean;
  language: Language;
  discount: number;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  authError: string | null;
  setAuthError: (error: string | null) => void;
  t: (key: string) => string;
  setLanguage: (lang: Language) => Promise<void>;
  setScreen: (screen: Screen) => void;
  setSelectedProduct: (product: Product | null) => void;
  setSelectedCategory: (category: string | null) => void;
  addToCart: (product: Product, variant?: ProductVariant) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (address: string, paymentMethod: string, coupon?: Coupon) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateOrderStatus: (userId: string, orderId: string, status: OrderStatus) => Promise<void>;
  refreshOrders: () => Promise<void>;
  fetchAllOrders: () => Promise<void>;
  // Wishlist functions
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  // Review functions
  submitReview: (productId: string, rating: number, comment: string) => Promise<void>;
  // Coupon functions
  applyCoupon: (code: string) => Promise<void>;
  validateCoupon: (code: string, subtotal: number) => Coupon | string;
  // Notification functions
  updateNotificationPreferences: (prefs: NotificationPreferences) => Promise<void>;
  // Auth functions
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  // Admin functions
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: { name: string; image: string; icon?: string }) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addBanner: (banner: { title: string; subtitle?: string; image: string }) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [adminOrders, setAdminOrders] = useState<{ [userId: string]: Order[] }>({});
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProductReviews, setSelectedProductReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [language, setLanguageState] = useState<Language>('en');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    if (user) {
      const sanitizedData = sanitizeForFirebase({ language: lang });
      try {
        await updateDoc(doc(db, 'users', user.uid), sanitizedData);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  // Error handling
  enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    GET = 'get',
    WRITE = 'write',
  }

  interface FirestoreErrorInfo {
    error: string;
    operationType: OperationType;
    path: string | null;
    authInfo: {
      userId?: string;
      email?: string | null;
      emailVerified?: boolean;
      isAnonymous?: boolean;
      tenantId?: string | null;
    }
  }

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  const initialized = React.useRef(false);

  // Real-time static data listeners (Products, Categories, Banners)
  useEffect(() => {
    console.log(">>> [FLOW] 1. Setting up products real-time listener...");
    
    const productsRef = query(collection(db, 'products'));

    const unsubscribeProducts = onSnapshot(productsRef, (snapshot) => {
      console.log(`>>> [FLOW] 2. Firestore Products snapshot received: ${snapshot.size} items`);
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        if (!data.name || !data.category) {
          console.warn(`>>> [FLOW] 2a. Invalid product data for ID ${doc.id}: missing name or category`, data);
        }
        return { id: doc.id, ...data };
      }) as Product[];
      
      console.log(">>> [FLOW] 3. Setting products state with:", list.length, "items");
      setProducts(list);
      setProductsLoaded(true);
      console.log(">>> [FLOW] 4. Products state update triggered");

      // Ensure some products have trending and bestSeller flags for sections to work
      if (list.length > 0) {
        const needsUpdate = list.some(p => p.trending === undefined || p.bestSeller === undefined);
        if (needsUpdate) {
          console.log(">>> [FLOW] 3b. Some products need flag updates...");
          list.forEach(async (p, idx) => {
            if (p.trending === undefined || p.bestSeller === undefined) {
              const updates: any = {};
              if (p.trending === undefined) updates.trending = idx % 2 === 0;
              if (p.bestSeller === undefined) updates.bestSeller = idx % 3 === 0;
              try {
                await updateDoc(doc(db, 'products', p.id), updates);
              } catch (e) {
                console.error(">>> [FLOW] 3c. Error updating product flags:", e);
              }
            }
          });
        }
      }
    }, (error) => {
      console.error(">>> [FLOW] 2-ERROR. Products listener error:", error);
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return () => {
      console.log(">>> [FLOW] Cleanup products real-time listener");
      unsubscribeProducts();
    };
  }, []);

  useEffect(() => {
    console.log(">>> [FLOW] 1. Setting up global real-time listeners (categories, banners)...");
    
    const categoriesRef = collection(db, 'categories');
    const unsubscribeCategories = onSnapshot(categoriesRef, (snapshot) => {
      console.log(`>>> [FLOW] 2. Firestore Categories snapshot received: ${snapshot.size} items`);
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        const image = data.image || (data.icon && (data.icon.startsWith('http') || data.icon.startsWith('data:image')) ? data.icon : '');
        return { id: doc.id, ...data, image };
      }) as Category[];
      
      const uniqueCategories = Array.from(new Map(list.map(item => [item.name, item])).values());
      console.log(">>> [FLOW] 3. Setting categories state with:", uniqueCategories.length, "items");
      setCategories(uniqueCategories);
    }, (error) => {
      console.error(">>> [FLOW] 2-ERROR. Categories listener error:", error);
      handleFirestoreError(error, OperationType.LIST, 'categories');
    });

    const bannersRef = collection(db, 'banners');
    const unsubscribeBanners = onSnapshot(bannersRef, (snapshot) => {
      console.log(`>>> [FLOW] 2. Firestore Banners snapshot received: ${snapshot.size} items`);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Banner[];
      console.log(">>> [FLOW] 3. Setting banners state with:", list.length, "items");
      setBanners(list);
    }, (error) => {
      console.error(">>> [FLOW] 2-ERROR. Banners listener error:", error);
      handleFirestoreError(error, OperationType.LIST, 'banners');
    });

    return () => {
      console.log(">>> [FLOW] Cleanup global real-time listeners");
      unsubscribeCategories();
      unsubscribeBanners();
    };
  }, []);

  // Real-time reviews listener for selected product
  useEffect(() => {
    if (!selectedProduct) {
      setSelectedProductReviews([]);
      return;
    }
    console.log(`Setting up reviews listener for product: ${selectedProduct.id}`);
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('productId', '==', selectedProduct.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
      // Sort client-side to avoid composite index requirement
      list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (Number(a.createdAt) || 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (Number(b.createdAt) || 0);
        return timeB - timeA;
      });
      setSelectedProductReviews(list);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `reviews`));
    return () => unsubscribe();
  }, [selectedProduct?.id]);

  // Auth state listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? `User logged in: ${user.uid}` : "User logged out");
      setUser(user);
      setLoading(false);
    });

    // Handle redirect result for WebView compatibility
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log("Redirect login successful:", result.user.uid);
      }
    }).catch((error) => {
      console.error("Redirect login error:", error);
      setAuthError(error.message || "Login failed");
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time user profile listener
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    console.log(`[Firestore] Setting up profile listener for: ${user.uid}`);
    const profileDoc = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(profileDoc, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        setProfile(data);
        if (data.language) setLanguageState(data.language);
        console.log(`[Firestore] Profile updated for: ${user.uid}`);
      } else {
        console.warn(`[Firestore] Profile document does not exist for: ${user.uid}, creating one...`);
        const profileData = sanitizeForFirebase({
          uid: user.uid,
          name: user.displayName || 'User',
          email: user.email,
          role: 'user',
          createdAt: Date.now()
        });
        try {
          await setDoc(profileDoc, profileData);
        } catch (e) {
          console.error("Error creating initial profile:", e);
        }
      }
    }, (error) => {
      console.error(`[Firestore] Profile listener error for ${user.uid}:`, error);
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });
    return () => {
      console.log(`Cleaning up profile listener for: ${user.uid}`);
      unsubscribe();
    };
  }, [user?.uid]);

  // Real-time cart listener
  useEffect(() => {
    if (!user) {
      setCart([]);
      return;
    }
    console.log(`[Firestore] Setting up cart listener for: ${user.uid}`);
    const cartDoc = doc(db, 'cart', user.uid);
    const unsubscribe = onSnapshot(cartDoc, (snapshot) => {
      if (snapshot.exists()) {
        const items = snapshot.data().items || [];
        setCart(items);
        console.log(`[Firestore] Cart updated for: ${user.uid} (${items.length} items)`);
      } else {
        setCart([]);
        console.log(`[Firestore] Cart document does not exist for: ${user.uid}, setting empty cart`);
      }
    }, (error) => {
      console.error(`[Firestore] Cart listener error for ${user.uid}:`, error);
      handleFirestoreError(error, OperationType.GET, `cart/${user.uid}`);
    });
    return () => {
      console.log(`Cleaning up cart listener for: ${user.uid}`);
      unsubscribe();
    };
  }, [user?.uid]);

  // Real-time user orders listener
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    console.log(`[Firestore] Setting up orders listener for: ${user.uid}`);
    const ordersRef = collection(db, 'orders', user.uid, 'userOrders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersList);
      console.log(`[Firestore] Orders updated for: ${user.uid} (${ordersList.length} orders)`);
    }, (error) => {
      console.error(`[Firestore] Orders listener error for ${user.uid}:`, error);
      handleFirestoreError(error, OperationType.LIST, `orders/${user.uid}/userOrders`);
    });
    return () => {
      console.log(`Cleaning up orders listener for: ${user.uid}`);
      unsubscribe();
    };
  }, [user?.uid]);

  // Real-time admin all orders listener
  useEffect(() => {
    if (profile?.role !== 'admin') {
      setAdminOrders({});
      return;
    }
    console.log("Setting up admin all_orders listener");
    const ordersRef = collection(db, 'all_orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
      const formatted: { [userId: string]: Order[] } = {};
      data.forEach(order => {
        if (!formatted[order.userId]) formatted[order.userId] = [];
        formatted[order.userId].push(order);
      });
      setAdminOrders(formatted);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'all_orders'));
    return () => unsubscribe();
  }, [profile?.role]);

  // Redirect logic
  useEffect(() => {
    if (!loading) {
      if (user) {
        if (['login', 'signup', 'splash', 'auth'].includes(currentScreen)) {
          setCurrentScreen('home');
        }
      } else {
        if (!['splash', 'signup', 'auth'].includes(currentScreen)) {
          setCurrentScreen('auth');
        }
      }
    }
  }, [user, loading, currentScreen]);

  const refreshOrders = async () => {
    // Orders are updated automatically by the listener
  };

  const fetchAllOrders = async () => {
    // Orders are updated automatically by the listener
  };

  const sanitizeForFirebase = (obj: any): any => {
    if (obj === undefined) return null;
    if (Array.isArray(obj)) {
      return obj
        .filter(v => v !== undefined)
        .map(v => sanitizeForFirebase(v));
    } else if (obj !== null && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, sanitizeForFirebase(v)])
      );
    }
    return obj;
  };

  const syncCart = async (newCart: CartItem[]) => {
    if (user) {
      const sanitizedCart = sanitizeForFirebase(newCart);
      try {
        await setDoc(doc(db, 'cart', user.uid), { items: sanitizedCart });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `cart/${user.uid}`);
      }
    }
  };

  const addToCart = (product: Product, variant?: ProductVariant) => {
    setCart(prev => {
      const cartItemId = variant ? `${product.id}-${variant.id}` : product.id;
      const existing = prev.find(item => item.cartItemId === cartItemId);
      
      let newCart;
      if (existing) {
        newCart = prev.map(item => item.cartItemId === cartItemId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item);
      } else {
        newCart = [...prev, { ...product, cartItemId, quantity: 1, selectedVariant: variant }];
      }
      syncCart(newCart);
      return newCart;
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.cartItemId !== cartItemId);
      syncCart(newCart);
      return newCart;
    });
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => {
      const newCart = prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity } : item);
      syncCart(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    syncCart([]);
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const validateCoupon = (code: string, subtotal: number): Coupon | string => {
    const coupon = MOCK_COUPONS.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) return 'invalidCoupon';
    if (coupon.expiryDate < Date.now()) return 'couponExpired';
    if (coupon.minPurchase && subtotal < coupon.minPurchase) return 'minPurchaseNotMet';
    return coupon;
  };

  const applyCoupon = async (code: string) => {
    setCouponError(null);
    const cartTotal = cart.reduce((sum, item) => {
      const price = Number(item.selectedVariant?.price || item.price) || 0;
      return sum + (price * item.quantity);
    }, 0);

    try {
      const querySnapshot = await getDocs(
        query(collection(db, "coupons"), where("code", "==", code))
      );

      if (querySnapshot.empty) {
        setCouponError("Invalid Coupon ❌");
        return;
      }

      const docData = querySnapshot.docs[0].data() as Coupon;

      if (!docData.isActive) {
        setCouponError("Coupon inactive ❌");
        return;
      }

      if (Date.now() > docData.expiryDate) {
        setCouponError("Coupon expired ❌");
        return;
      }

      if (docData.minPurchase && cartTotal < docData.minPurchase) {
        setCouponError("Minimum order not reached ❌");
        return;
      }

      let discountValue = 0;

      if (docData.discountType === "percentage") {
        discountValue = (cartTotal * docData.discountValue) / 100;
      } else {
        discountValue = docData.discountValue;
      }

      setDiscount(discountValue);
      setAppliedCoupon(docData);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "coupons");
    }
  };

  const placeOrder = async (address: string, paymentMethod: string, couponArg?: Coupon) => {
    if (!user || cart.length === 0) return;
    setLoading(true);
    const orderId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    try {
      const subtotal = (cart || []).reduce((sum, item) => {
        const price = Number(item.selectedVariant?.price || item.price) || 0;
        return sum + (price * item.quantity);
      }, 0);

      const activeCoupon = couponArg || appliedCoupon;
      let orderDiscount = 0;
      if (activeCoupon) {
        if (activeCoupon.discountType === 'percentage') {
          orderDiscount = (subtotal * activeCoupon.discountValue) / 100;
        } else {
          orderDiscount = activeCoupon.discountValue;
        }
      } else {
        orderDiscount = discount;
      }

      const total = subtotal - orderDiscount;
      
      // Ensure items have correct price when saved to order
      const orderItems = cart.map(item => ({
        ...item,
        price: Number(item.selectedVariant?.price || item.price) || 0
      }));

      const newOrder: Omit<Order, 'id'> = {
        userId: user.uid,
        items: orderItems,
        subtotal,
        discount: orderDiscount,
        total,
        status: 'Order Placed',
        address,
        paymentMethod,
        createdAt: Date.now(),
        estimatedDelivery: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
        trackingNumber: `SIP${Math.floor(Math.random() * 1000000)}`,
        couponCode: activeCoupon?.code
      };

      const sanitizedOrder = sanitizeForFirebase(newOrder);
      // Save to user's orders
      await setDoc(doc(db, 'orders', user.uid, 'userOrders', orderId), sanitizedOrder);
      // Also save to global orders for admin
      await setDoc(doc(db, 'all_orders', orderId), sanitizedOrder);
      
      clearCart();
      // Orders will be updated automatically by the listener
      setCurrentScreen('orders');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${user.uid}/userOrders/${orderId}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user || !profile) return;
    const currentWishlist = profile.wishlist || [];
    const isAlreadyIn = currentWishlist.includes(productId);
    const newWishlist = isAlreadyIn 
      ? currentWishlist.filter(id => id !== productId)
      : [...currentWishlist, productId];
    
    const sanitizedData = sanitizeForFirebase({ wishlist: newWishlist });
    try {
      await updateDoc(doc(db, 'users', user.uid), sanitizedData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const isInWishlist = (productId: string) => {
    return profile?.wishlist?.includes(productId) || false;
  };

  const submitReview = async (productId: string, rating: number, comment: string) => {
    if (!user || !profile) return;
    
    const review = {
      userId: user.uid,
      productId: productId,
      userName: profile.name || user.displayName || "Anonymous",
      rating,
      comment,
      createdAt: serverTimestamp()
    };
    
    const sanitizedReview = sanitizeForFirebase(review);
    try {
      await addDoc(collection(db, 'reviews'), sanitizedReview);
      console.log("✅ Review submitted");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `reviews`);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const sanitizedData = sanitizeForFirebase(data);
    try {
      await updateDoc(doc(db, 'users', user.uid), sanitizedData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const updateOrderStatus = async (userId: string, orderId: string, status: OrderStatus) => {
    try {
      const orderRef = doc(db, 'orders', userId, 'userOrders', orderId);
      const allOrderRef = doc(db, 'all_orders', orderId);
      const sanitizedData = sanitizeForFirebase({ status });
      
      await updateDoc(orderRef, sanitizedData);
      await updateDoc(allOrderRef, sanitizedData);
      
      // Orders will be updated automatically by the listener
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${userId}/userOrders/${orderId}`);
    }
  };

  // Auth functions
  const updateNotificationPreferences = async (prefs: NotificationPreferences) => {
    if (!user) return;
    const sanitizedData = sanitizeForFirebase({ notificationPreferences: prefs });
    try {
      await updateDoc(doc(db, 'users', user.uid), sanitizedData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        setAuthError(`Domain not authorized. Please add "${window.location.hostname}" to your Firebase Console > Authentication > Settings > Authorized domains.`);
      } else {
        setAuthError(error.message || "Login failed");
      }
      setLoading(false);
    }
  };

  const loginWithFacebook = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithRedirect(auth, facebookProvider);
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        setAuthError(`Domain not authorized. Please add "${window.location.hostname}" to your Firebase Console > Authentication > Settings > Authorized domains.`);
      } else {
        setAuthError(error.message || "Login failed");
      }
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Login error:", error);
      setAuthError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      const user = result.user;
      const profileData = sanitizeForFirebase({
        uid: user.uid,
        name,
        email,
        role: 'user',
        createdAt: Date.now()
      });
      await setDoc(doc(db, 'users', user.uid), profileData);
    } catch (error: any) {
      console.error("Registration error:", error);
      setAuthError(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentScreen('auth');
  };

  // Admin functions
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const productsRef = collection(db, 'products');
      const sanitizedProduct = sanitizeForFirebase(product);
      await addDoc(productsRef, sanitizedProduct);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      const productRef = doc(db, 'products', id);
      const sanitizedProduct = sanitizeForFirebase(product);
      await updateDoc(productRef, sanitizedProduct);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const productRef = doc(db, 'products', id);
      await deleteDoc(productRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const addCategory = async (category: { name: string; image: string; icon?: string }) => {
    try {
      const categoriesRef = collection(db, 'categories');
      const sanitizedCategory = sanitizeForFirebase({ ...category, createdAt: Date.now() });
      await addDoc(categoriesRef, sanitizedCategory);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'categories');
    }
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    try {
      const categoryRef = doc(db, 'categories', id);
      const sanitizedCategory = sanitizeForFirebase(category);
      await updateDoc(categoryRef, sanitizedCategory);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `categories/${id}`);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const categoryRef = doc(db, 'categories', id);
      await deleteDoc(categoryRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
    }
  };

  const addBanner = async (banner: { title: string; subtitle?: string; image: string }) => {
    try {
      const bannersRef = collection(db, 'banners');
      const sanitizedBanner = sanitizeForFirebase({ ...banner, createdAt: Date.now() });
      await addDoc(bannersRef, sanitizedBanner);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'banners');
    }
  };

  return (
    <AppContext.Provider value={{
      user, profile, products, cart, orders, adminOrders, currentScreen, selectedProduct, selectedCategory, loading, language,
      discount, appliedCoupon, couponError,
      authError,
      setAuthError,
      t,
      setLanguage,
      setScreen: setCurrentScreen,
      setSelectedProduct,
      setSelectedCategory,
      setSelectedProductReviews,
      selectedProductReviews,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      placeOrder,
      updateProfile,
      updateOrderStatus,
      refreshOrders,
      fetchAllOrders,
      toggleWishlist,
      isInWishlist,
      submitReview,
      applyCoupon,
      validateCoupon,
      updateNotificationPreferences,
      loginWithGoogle,
      loginWithFacebook,
      loginWithEmail,
      registerWithEmail,
      logout,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      addBanner,
      categories,
      banners,
      productsLoaded
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
