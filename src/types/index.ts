export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discount: number;
  image: string;
  rating: number;
  reviewCount: number;
  isNew: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

export interface Brand {
  id: string;
  name: string;
  subtitle: string;
  gradient: string;
  logo: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Member {
  email: string;
  joinedAt: string;
}

export interface Item {
  id: number;
  title: string;
  createdAt: Date;
}
