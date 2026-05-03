export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

export interface Local {
  id: string;
  name: string;
  description: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  reviewCount: number;
  images: string[];
  menu: MenuItem[];
  categories: string[];
  ownerId: string;
  hours: {
    open: string; // e.g., "08:00"
    close: string; // e.g., "22:00"
  };
  reviews: Review[];
  isPromoted?: boolean;
  phoneNumber?: string;
  hasReservations?: boolean;
  hasPreOrder?: boolean;
  reservationPolicy?: string;
}
