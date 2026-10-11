import { UserSession, CartItem } from '../types/index.js';

class StateManager {
  private sessions: Map<string, UserSession> = new Map();

  public getSession(phone: string, userName?: string): UserSession {
    let session = this.sessions.get(phone);
    if (!session) {
      session = {
        phone,
        userName: userName || 'ग्राहक',
        currentFlow: 'INITIAL',
        stateData: {},
        historyStack: [],
        cart: [],
        lastActive: Date.now()
      };
      this.sessions.set(phone, session);
    } else {
      session.lastActive = Date.now();
      if (userName && !session.userName) {
        session.userName = userName;
      }
    }
    return session;
  }

  public pushState(session: UserSession, nextFlow: string, nextStateData: Record<string, any> = {}): void {
    // Avoid pushing identical consecutive states
    const lastState = session.historyStack[session.historyStack.length - 1];
    if (!lastState || lastState.flow !== session.currentFlow) {
      session.historyStack.push({
        flow: session.currentFlow,
        stateData: { ...session.stateData }
      });
    }
    session.currentFlow = nextFlow;
    session.stateData = { ...nextStateData };
    session.lastActive = Date.now();
  }

  public popState(session: UserSession): { flow: string; stateData: Record<string, any> } | null {
    if (session.historyStack.length > 0) {
      const prev = session.historyStack.pop()!;
      session.currentFlow = prev.flow;
      session.stateData = { ...prev.stateData };
      session.lastActive = Date.now();
      return prev;
    }
    // If empty stack, default to MAIN_MENU
    session.currentFlow = 'MAIN_MENU';
    session.stateData = {};
    return null;
  }

  public resetToMainMenu(session: UserSession): void {
    session.currentFlow = 'MAIN_MENU';
    session.stateData = {};
    session.historyStack = [];
    session.lastActive = Date.now();
  }

  public addToCart(session: UserSession, item: CartItem): void {
    const existingIndex = session.cart.findIndex(
      (i) => i.productId === item.productId && i.selectedSize === item.selectedSize
    );
    if (existingIndex > -1) {
      session.cart[existingIndex].quantity += item.quantity;
      session.cart[existingIndex].totalPrice = 
        session.cart[existingIndex].quantity * session.cart[existingIndex].unitPrice;
    } else {
      session.cart.push(item);
    }
  }

  public removeFromCart(session: UserSession, index: number): boolean {
    if (index >= 0 && index < session.cart.length) {
      session.cart.splice(index, 1);
      return true;
    }
    return false;
  }

  public clearCart(session: UserSession): void {
    session.cart = [];
  }

  public getAllSessions(): UserSession[] {
    return Array.from(this.sessions.values());
  }
}

export const stateManager = new StateManager();
