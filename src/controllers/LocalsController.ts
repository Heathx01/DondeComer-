import { Local } from '../models/Local';
import { calculateDistance } from '../services/LocationService';

// Mock data for initial development
const MOCK_LOCALS: Local[] = [
  {
    id: '1',
    name: 'El Palacio de la Pizza',
    description: 'Las mejores pizzas a la leña con ingredientes frescos.',
    address: 'Av. Gastronomía 123, CABA',
    coordinates: { latitude: -34.6037, longitude: -58.3816 },
    rating: 4.8,
    reviewCount: 156,
    images: [
      'https://picsum.photos/800/600?random=1',
      'https://picsum.photos/800/600?random=11',
      'https://picsum.photos/800/600?random=12'
    ],
    menu: [
      { id: 'm1', name: 'Muzzarella Special', description: 'Mucha muzzarella y aceitunas', price: 1200 },
      { id: 'm2', name: 'Pepperoni Blast', description: 'Picante y deliciosa', price: 1400 }
    ],
    categories: ['Pizza', 'Italian'],
    ownerId: 'owner1',
    hours: { open: '10:00', close: '23:59' },
    reviews: [
      { id: 'r1', userId: 'u1', userName: 'Juan Perez', rating: 5, comment: 'Excelente pizza!', date: '2024-05-01' },
      { id: 'r2', userId: 'u2', userName: 'Maria Garcia', rating: 4, comment: 'Muy rica, tardaron un poco.', date: '2024-04-28' }
    ],
    isPromoted: true,
    phoneNumber: '+5491112345678',
    hasReservations: true,
    hasPreOrder: true,
    reservationPolicy: 'Reserva con 2 horas de anticipación.'
  },
  {
    id: '2',
    name: 'Burger King+ ',
    description: 'Hamburguesas gigantes con sabor ahumado.',
    address: 'Calle del Sabor 456, CABA',
    coordinates: { latitude: -34.6050, longitude: -58.3830 },
    rating: 4.5,
    reviewCount: 89,
    images: [
      'https://picsum.photos/800/600?random=2',
      'https://picsum.photos/800/600?random=21'
    ],
    menu: [
      { id: 'b1', name: 'Doble Bacon', description: 'Dos carnes, mucho bacon', price: 1500 }
    ],
    categories: ['Burger', 'Fast Food'],
    ownerId: 'owner2',
    hours: { open: '11:00', close: '23:00' },
    reviews: [],
    phoneNumber: '+5491187654321',
    hasReservations: false,
    hasPreOrder: true
  },
  {
    id: '3',
    name: 'Sushi Zen',
    description: 'Sushi fresco y tradicional.',
    address: 'Av. Libertador 789, CABA',
    coordinates: { latitude: -34.5800, longitude: -58.4000 },
    rating: 4.9,
    reviewCount: 210,
    images: ['https://picsum.photos/800/600?random=3'],
    menu: [],
    categories: ['Sushi', 'Japanese'],
    ownerId: 'owner3',
    hours: { open: '19:00', close: '00:00' },
    reviews: [],
    isPromoted: true,
    hasReservations: true,
    hasPreOrder: false
  },
  {
    id: '4',
    name: 'Tacos El Wey',
    description: 'Auténticos tacos mexicanos.',
    address: 'Calle Falsa 123, Lanús',
    coordinates: { latitude: -34.7000, longitude: -58.4000 },
    rating: 4.2,
    reviewCount: 45,
    images: ['https://picsum.photos/800/600?random=4'],
    menu: [],
    categories: ['Tacos', 'Mexican'],
    ownerId: 'owner4',
    hours: { open: '09:00', close: '18:00' },
    reviews: [],
    hasReservations: true,
    hasPreOrder: true
  }
];

export const LocalsController = {
  getFeaturedLocals: (): Local[] => {
    return MOCK_LOCALS.sort((a, b) => b.rating - a.rating);
  },

  getPromotedLocals: (): Local[] => {
    return MOCK_LOCALS.filter(l => l.isPromoted);
  },

  searchLocals: (query: string, filters?: { minRating?: number, onlyOpen?: boolean }): Local[] => {
    const lowerQuery = query.toLowerCase();
    let filtered = MOCK_LOCALS.filter(local =>
      local.name.toLowerCase().includes(lowerQuery) ||
      local.categories.some(cat => cat.toLowerCase().includes(lowerQuery))
    );

    if (filters?.minRating) {
      filtered = filtered.filter(l => l.rating >= filters.minRating!);
    }

    if (filters?.onlyOpen) {
      filtered = filtered.filter(l => LocalsController.isLocalOpen(l));
    }

    return filtered;
  },

  getLocalsByDistance: (userCoords: { latitude: number, longitude: number }, maxKm: number): Local[] => {
    return MOCK_LOCALS.filter(local => {
      const distance = calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        local.coordinates.latitude,
        local.coordinates.longitude
      );
      return distance <= maxKm;
    });
  },

  isLocalOpen: (local: Local): boolean => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [openH, openM] = local.hours.open.split(':').map(Number);
    const [closeH, closeM] = local.hours.close.split(':').map(Number);

    const openTime = openH * 60 + openM;
    let closeTime = closeH * 60 + closeM;

    // Si el cierre es después de medianoche
    if (closeTime < openTime) {
      // Si la hora actual es antes de medianoche (por ejemplo, 22:00)
      if (currentTime >= openTime) {
        return true;
      }
      // Si la hora actual es después de medianoche (por ejemplo, 01:00)
      if (currentTime <= closeTime) {
        return true;
      }
      return false;
    }

    return currentTime >= openTime && currentTime <= closeTime;
  },

  addReview: (localId: string, rating: number, comment: string): void => {
    const local = MOCK_LOCALS.find(l => l.id === localId);
    if (local) {
      const newReview = {
        id: Math.random().toString(36).substring(2, 9),
        userId: 'current_user',
        userName: 'Tú', // En una app real vendría del contexto de usuario
        rating,
        comment,
        date: new Date().toISOString().split('T')[0]
      };
      local.reviews.unshift(newReview);
      // Recalcular promedio (Lógica básica para la demo)
      local.rating = Number((((local.rating * local.reviewCount) + rating) / (local.reviewCount + 1)).toFixed(1));
      local.reviewCount += 1;
    }
  }
};
