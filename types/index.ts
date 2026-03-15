export type GiftResult = {
  id: string;
  name: string;
  price: number;
  currency: "SAR";
  store: string;
  url: string;
  imageUrl?: string;
  badge?: string | null;
  inStock: boolean;
};

export type CompareResult = {
  product: GiftResult;
  pros: string[];
  cons: string[];
  aiSummary: string;
};

export type UserProfile = {
  id: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  created_at: string;
};

export type CreditPackage = {
  id: string;
  credits: number;
  price: number;
  currency: "SAR";
};