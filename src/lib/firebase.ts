// MOCK FIREBASE FOR DEMO MODE
// Since Firebase setup was declined, we provide a mock layer to keep the app functional for preview.

let authListener: any = null;

export const auth: any = {
  currentUser: null,
  onAuthStateChanged: (authInstance: any, callback: any) => {
    authListener = callback;
    callback(auth.currentUser);
    return () => { authListener = null; };
  },
  signOut: (authInstance: any) => {
    auth.currentUser = null;
    if (authListener) authListener(null);
  },
  signInWithPopup: (authInstance: any, provider: any) => {
    auth.currentUser = {
      uid: "demo-user-123",
      displayName: "João Silva",
      email: "joao@condo.com"
    };
    if (authListener) authListener(auth.currentUser);
    return Promise.resolve();
  },
  signInWithEmailAndPassword: (authInstance: any, email: string, pass: string) => {
    const validEmails = ["demo@condo.com", "sindico@condo.com", "morador@condo.com"];
    const validPass = "123456";

    if (!validEmails.includes(email) || pass !== validPass) {
      return Promise.reject(new Error("E-mail ou senha inválidos para esta demonstração."));
    }

    let uid = "resident-123";
    let displayName = "Usuário Demo";
    if (email.includes("sindico")) {
      uid = "sindico-123";
      displayName = "Ricardo Silva (Síndico)";
    } else if (email.includes("morador")) {
      uid = "morador-305";
      displayName = "Carla Souza";
    }

    auth.currentUser = { 
      uid, 
      email,
      displayName
    };
    if (authListener) authListener(auth.currentUser);
    return Promise.resolve({ user: auth.currentUser });
  },
  createUserWithEmailAndPassword: (authInstance: any, email: string, pass: string) => {
    return Promise.reject(new Error("O cadastro de novos usuários está desabilitado nesta demonstração. Utilize as contas de exemplo."));
  },
  sendPasswordResetEmail: (authInstance: any, email: string) => {
    console.log(`Password reset email sent to ${email}`);
    return Promise.resolve();
  }
};

export const db: any = {}; // Firestore mock

// Mock Firestore functions
export const collection = (db: any, name: string) => name;
export const query = (col: any, ...args: any[]) => col;
export const where = (...args: any[]) => args;
export const orderBy = (...args: any[]) => args;
export const limit = (...args: any[]) => args;
export const doc = (db: any, col: string, id: string) => ({ id });
export const getDoc = (ref: any) => {
  // Simple hack for demo: if email (which we store in our mock app) 
  // contains "sindico", return syndic role
  const isSyndic = ref.id.includes("sindico"); // ref.id is uid in App.tsx
  const isMorador = ref.id.includes("morador");
  return Promise.resolve({ 
    exists: () => true, 
    data: () => ({ 
      role: isSyndic ? "syndic" : "resident", 
      displayName: isSyndic ? "Ricardo Silva (Síndico)" : (isMorador ? "Carla Souza" : "Usuário Demo"),
      unit: isMorador ? "305" : "402"
    }) 
  });
};
export const setDoc = (ref: any, data: any) => Promise.resolve();

// Mock Real-time data
export const onSnapshot = (q: any, next: any, error?: any) => {
  const mockData: any = {
    deliveries: [
      { id: "1", courier: "Amazon", trackingCode: "AMZ123", status: "received_at_gate", receivedAt: new Date().toISOString(), residentId: "demo-user-123" },
      { id: "2", courier: "Mercado Livre", trackingCode: "ML987", status: "picked_up", receivedAt: new Date(Date.now() - 86400000).toISOString(), residentId: "demo-user-123" }
    ],
    finances: [
      { id: "f1", month: "Maio", year: 2026, totalIncome: 45000, totalExpenses: 32000, categories: [{category: "Manutenção", amount: 15000}, {category: "Limpeza", amount: 8000}, {category: "Segurança", amount: 9000}] },
      { id: "f2", month: "Abril", year: 2026, totalIncome: 44500, totalExpenses: 38000, categories: [] }
    ],
    notices: [
      { id: "n1", title: "Limpeza de Caixa d'Água", content: "Ocorrerá na próxima terça-feira às 08:00.", type: "maintenance", createdAt: new Date().toISOString() },
      { id: "n2", title: "Festa Junina do Condomínio", content: "Reserve a data! Dia 20/06 no salão de festas.", type: "event", createdAt: new Date().toISOString() }
    ],
    bookings: [
      { id: "b1", area: "grill", date: "2026-05-25", startTime: "12:00", endTime: "18:00", status: "confirmed", residentId: "demo-user-123" }
    ]
  };

  next({
    docs: (mockData[q] || []).map((d: any) => ({
      id: d.id,
      data: () => d
    }))
  });
  return () => {};
};

export const app = {};
export const GoogleAuthProvider = class {};
export const onAuthStateChanged = (authInstance: any, callback: any) => auth.onAuthStateChanged(authInstance, callback);
export const signInWithPopup = (authInstance: any, provider: any) => auth.signInWithPopup(authInstance, provider);
export const signInWithEmailAndPassword = (authInstance: any, email: string, pass: string) => auth.signInWithEmailAndPassword(authInstance, email, pass);
export const createUserWithEmailAndPassword = (authInstance: any, email: string, pass: string) => auth.createUserWithEmailAndPassword(authInstance, email, pass);
export const sendPasswordResetEmail = (authInstance: any, email: string) => auth.sendPasswordResetEmail(authInstance, email);
