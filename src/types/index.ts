export type Category = 'agriculture' | 'construction';

export type AgriSubcategory = 
  | 'seeds' 
  | 'fertilizers' 
  | 'pesticides' 
  | 'other_agri';

export type ConstructionSubcategory = 
  | 'cement' 
  | 'steel' 
  | 'ms_angle' 
  | 'ms_channel' 
  | 'ms_pipe' 
  | 'pvc_pipe' 
  | 'gi_sheet' 
  | 'binding_wire' 
  | 'fencing';

export type Subcategory = AgriSubcategory | ConstructionSubcategory;

export interface Product {
  id: string;
  category: Category;
  subcategory: Subcategory;
  name: string;
  nameMarathi: string;
  brand: string;
  packSize: string;
  available: boolean;
  price: number;
  unit: string;
  description: string;
  crops?: string[]; // for seeds & pesticides e.g. 'कापूस', 'सोयाबीन'
  problemType?: ('pest' | 'disease' | 'weed' | 'guidance')[]; // for pesticides
  sizes?: string[]; // for steel, angle, pipes
  popular?: boolean;
}

export interface DailyRate {
  id: string;
  category: string;
  item: string;
  rate: string;
  unit: string;
  updatedAt: string;
  notes?: string;
}

export interface StoreInfo {
  name: string;
  nameMarathi: string;
  tagline: string;
  address: string;
  phones: string[];
  whatsappNumber: string;
  expertName: string;
  expertRole: string;
  expertPhone: string;
  timings: string;
  upiId: string;
  googleMapsUrl: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  brand: string;
  selectedSize?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  orderId: string;
  customerPhone: string;
  customerName: string;
  address: string;
  items: CartItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  notes?: string;
}

export interface UserSession {
  phone: string;
  userName?: string;
  currentFlow: string;
  stateData: Record<string, any>;
  historyStack: Array<{ flow: string; stateData: Record<string, any> }>;
  cart: CartItem[];
  customerName?: string;
  customerAddress?: string;
  lastActive: number;
}

export interface InteractiveButton {
  id: string;
  title: string;
}

export interface InteractiveListRow {
  id: string;
  title: string;
  description?: string;
}

export interface InteractiveListSection {
  title: string;
  rows: InteractiveListRow[];
}

export interface InteractiveMessage {
  type: 'button' | 'list';
  header?: string;
  body: string;
  footer?: string;
  buttons?: InteractiveButton[];
  sections?: InteractiveListSection[];
  buttonText?: string;
}

export interface BotResponse {
  text: string;
  interactive?: InteractiveMessage;
  mediaUrl?: string;
  delayMs?: number;
}
