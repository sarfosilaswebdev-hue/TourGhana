export type Category = "NATURE" | "CULTURAL" | "HISTORICAL" | "ADVENTURE" | "BEACH";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface Destination {
  id: string;
  name: string;
  description: string;
  region: string;
  category: Category;
  latitude: number;
  longitude: number;
  rating: number;
  tags: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  clerkId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  interests: Category[];
  createdAt: string;
  _count?: { bookings: number };
}

export interface Booking {
  id: string;
  userId: string;
  destinationId: string;
  tourDate: string;
  groupSize: number;
  fullName: string;
  email: string;
  phone: string;
  specialRequest?: string;
  status: BookingStatus;
  createdAt: string;
  destination?: Destination;
  user?: Pick<User, "id" | "firstName" | "lastName" | "email" | "avatarUrl">;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  destinationId: string;
  createdAt: string;
  user?: Pick<User, "id" | "firstName" | "lastName" | "email" | "avatarUrl">;
  destination?: Pick<Destination, "id" | "name">;
}

export interface Stats {
  totalDestinations: number;
  totalBookings: number;
  totalUsers: number;
  totalReviews: number;
  pendingBookings: number;
}

export interface PaginatedResponse<T> {
  status: string;
  results: number;
  total: number;
  page: number;
  totalPages: number;
  data: T[];
}
