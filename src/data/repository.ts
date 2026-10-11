import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product, DailyRate, StoreInfo, Order } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogPath = path.join(__dirname, 'catalog.json');
const ratesPath = path.join(__dirname, 'rates.json');
const storeInfoPath = path.join(__dirname, 'storeInfo.json');
const ordersPath = path.join(__dirname, 'orders.json');

class DataRepository {
  private products: Product[] = [];
  private rates: DailyRate[] = [];
  private storeInfo!: StoreInfo;
  private orders: Order[] = [];

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    try {
      this.products = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
    } catch (e) {
      console.error('Error loading catalog.json:', e);
      this.products = [];
    }

    try {
      this.rates = JSON.parse(fs.readFileSync(ratesPath, 'utf-8'));
    } catch (e) {
      console.error('Error loading rates.json:', e);
      this.rates = [];
    }

    try {
      this.storeInfo = JSON.parse(fs.readFileSync(storeInfoPath, 'utf-8'));
    } catch (e) {
      console.error('Error loading storeInfo.json:', e);
    }

    try {
      this.orders = JSON.parse(fs.readFileSync(ordersPath, 'utf-8'));
    } catch (e) {
      console.error('Error loading orders.json:', e);
      this.orders = [];
    }
  }

  public getStoreInfo(): StoreInfo {
    return this.storeInfo;
  }

  public updateStoreInfo(info: Partial<StoreInfo>): StoreInfo {
    this.storeInfo = { ...this.storeInfo, ...info };
    fs.writeFileSync(storeInfoPath, JSON.stringify(this.storeInfo, null, 2), 'utf-8');
    return this.storeInfo;
  }

  public getAllProducts(): Product[] {
    try {
      this.products = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
    } catch (e) {}
    return this.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  public getProductsByCategory(category: string): Product[] {
    return this.products.filter((p) => p.category === category);
  }

  public getProductsBySubcategory(subcategory: string): Product[] {
    return this.products.filter((p) => p.subcategory === subcategory);
  }

  public getProductsByCrop(cropName: string): Product[] {
    return this.products.filter(
      (p) => p.subcategory === 'seeds' && p.crops?.some((c) => c.includes(cropName) || cropName.includes(c))
    );
  }

  public getPesticidesByCropAndProblem(cropName: string, problemType: 'pest' | 'disease' | 'weed' | 'guidance'): Product[] {
    return this.products.filter((p) => {
      if (p.subcategory !== 'pesticides') return false;
      const cropMatch = p.crops?.some((c) => c.includes(cropName) || cropName.includes(c) || c === 'इतर पीक');
      const problemMatch = p.problemType?.includes(problemType);
      return cropMatch && problemMatch;
    });
  }

  public getDailyRates(): DailyRate[] {
    try {
      this.rates = JSON.parse(fs.readFileSync(ratesPath, 'utf-8'));
    } catch (e) {}
    return this.rates;
  }

  public updateDailyRate(id: string, rate: string, notes?: string): DailyRate | null {
    const item = this.rates.find((r) => r.id === id);
    if (item) {
      item.rate = rate;
      if (notes !== undefined) item.notes = notes;
      item.updatedAt = 'आजचे ताजे दर';
      fs.writeFileSync(ratesPath, JSON.stringify(this.rates, null, 2), 'utf-8');
      return item;
    }
    return null;
  }

  public addProduct(product: Product): Product {
    this.products.push(product);
    fs.writeFileSync(catalogPath, JSON.stringify(this.products, null, 2), 'utf-8');
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx > -1) {
      this.products[idx] = { ...this.products[idx], ...updates };
      fs.writeFileSync(catalogPath, JSON.stringify(this.products, null, 2), 'utf-8');
      return this.products[idx];
    }
    return null;
  }

  public getOrders(phone?: string): Order[] {
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      return this.orders.filter((o) => o.customerPhone.replace(/[^0-9]/g, '').includes(cleanPhone));
    }
    return this.orders;
  }

  public getOrderById(orderId: string): Order | undefined {
    return this.orders.find((o) => o.orderId.toLowerCase() === orderId.toLowerCase());
  }

  public createOrder(order: Order): Order {
    this.orders.unshift(order);
    fs.writeFileSync(ordersPath, JSON.stringify(this.orders, null, 2), 'utf-8');
    return order;
  }

  public updateOrderStatus(orderId: string, status: Order['status']): Order | null {
    const order = this.orders.find((o) => o.orderId === orderId);
    if (order) {
      order.status = status;
      fs.writeFileSync(ordersPath, JSON.stringify(this.orders, null, 2), 'utf-8');
      return order;
    }
    return null;
  }
}

export const dataRepository = new DataRepository();
