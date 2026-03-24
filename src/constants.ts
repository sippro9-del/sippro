import { Product } from './types';

export const CATEGORIES = [
  { id: 'haldi', name: 'Haldi', icon: '🫚', color: '#F59E0B' },
  { id: 'mirchi', name: 'Mirchi', icon: '🌶️', color: '#C2410C' },
  { id: 'masala', name: 'Masala', icon: '🥘', color: '#9A3412' },
  { id: 'herbs', name: 'Herbs', icon: '🌿', color: '#16A34A' },
  { id: 'grocery', name: 'Grocery', icon: '🛒', color: '#F97316' },
];

export const DELIVERY_CENTER = {
  lat: 25.15,
  lng: 82.58,
  name: 'Varanasi/Mirzapur'
};

export const ALLOWED_PINCODES = [
  "221001", "221002", "221003", "221004", "221005",
  "221006", "221007", "221008", "221010", "231305"
];

export const MAX_DELIVERY_RADIUS_KM = 50;

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium Red Chili Powder',
    description: 'Authentic stone-ground red chili powder with intense heat and vibrant color. Perfect for traditional curries.',
    price: 12.99,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800',
    category: 'mirchi',
    featured: true,
    trending: true,
    bestSeller: true,
    stock: 50
  },
  {
    id: '2',
    name: 'Organic Turmeric Root',
    description: 'High-curcumin turmeric powder sourced directly from organic farms. Known for its medicinal properties.',
    price: 9.50,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
    category: 'haldi',
    featured: true,
    bestSeller: false,
    stock: 100
  },
  {
    id: '3',
    name: 'Whole Black Peppercorns',
    description: 'Tellicherry black peppercorns, bold and aromatic. Freshly ground for the best flavor.',
    price: 15.00,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=800',
    category: 'masala',
    trending: true,
    bestSeller: true,
    stock: 30
  },
  {
    id: '4',
    name: 'Green Cardamom Pods',
    description: 'Exquisite green cardamom pods with a sweet, floral aroma. Essential for desserts and chai.',
    price: 24.99,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1599148400620-8e1ff0bf28d8?auto=format&fit=crop&q=80&w=800',
    category: 'masala',
    featured: true,
    bestSeller: false,
    stock: 20
  },
  {
    id: '5',
    name: 'Cinnamon Sticks (Ceylon)',
    description: 'True Ceylon cinnamon sticks, delicate and sweet. Perfect for both sweet and savory dishes.',
    price: 18.25,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&q=80&w=800',
    category: 'masala',
    bestSeller: true,
    stock: 40
  },
  {
    id: '6',
    name: 'Star Anise',
    description: 'Beautifully shaped star anise with a distinct licorice-like flavor. Great for biryanis and soups.',
    price: 11.00,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1599148400620-8e1ff0bf28d8?auto=format&fit=crop&q=80&w=800',
    category: 'masala',
    trending: true,
    bestSeller: false,
    stock: 60
  }
];
