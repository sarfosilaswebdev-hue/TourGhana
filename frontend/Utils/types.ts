

export enum Category {
  NATURE = "NATURE",
  CULTURAL = "CULTURAL",
  HISTORICAL = "HISTORICAL",
  ADVENTURE = "ADVENTURE",
  BEACH = "BEACH",
}

export interface User {
  id: string;
  clerkId: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  email: string;
  interests: Category[];
  createdAt: Date;
}

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
  createdAt: Date;
}

export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
}

export interface Conversation {
  id: string;
}

export interface Message {
  id?: string;
  role: MessageRole;
  content: string;
 
}
