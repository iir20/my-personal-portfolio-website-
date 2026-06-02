// Ismail Ibne Ratul Cyberpunk Portfolio - Serverless Secure Database Module
// Replaces Google Firebase Firestore & Storage with native client-side IndexedDB databases.
// Adheres strictly to the serverless, offline-first mandate.

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

// Global empty fallback variables to prevent import crashes
export const db = null as any;
export const auth = null as any;
export const storage = null as any;

// Helper to handle client-side SHA-256 hashing
export async function sha256(password: string): Promise<string> {
  try {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch (err) {
    // Basic browser-safe fallback hash if Web Crypto isn't fully enabled
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `hash-fallback-${hash}`;
  }
}

// ----------------------------------------------------
// DATABASE INDEXEDDB ENGINE
// ----------------------------------------------------
export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ratul_cyberdeck_db", 1);
    
    request.onupgradeneeded = (e) => {
      const dbInstance = request.result;
      
      if (!dbInstance.objectStoreNames.contains("portfolio")) {
        dbInstance.createObjectStore("portfolio");
      }
      if (!dbInstance.objectStoreNames.contains("projects")) {
        dbInstance.createObjectStore("projects", { keyPath: "id" });
      }
      if (!dbInstance.objectStoreNames.contains("skills")) {
        dbInstance.createObjectStore("skills", { keyPath: "id" });
      }
      if (!dbInstance.objectStoreNames.contains("contacts")) {
        dbInstance.createObjectStore("contacts", { keyPath: "id" });
      }
      if (!dbInstance.objectStoreNames.contains("backups")) {
        dbInstance.createObjectStore("backups", { keyPath: "id" });
      }
      if (!dbInstance.objectStoreNames.contains("analytics")) {
        dbInstance.createObjectStore("analytics", { keyPath: "id" });
      }
      if (!dbInstance.objectStoreNames.contains("settings")) {
        dbInstance.createObjectStore("settings");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// IndexedDB basic operation helpers
export function getByKey(dbInstance: IDBDatabase, storeName: string, key: string): Promise<any> {
  return new Promise((resolve) => {
    try {
      const transaction = dbInstance.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export function writeToStore(dbInstance: IDBDatabase, storeName: string, key: string | null, value: any): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const transaction = dbInstance.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      let request;
      if (key) {
        request = store.put(value, key);
      } else {
        request = store.put(value);
      }
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
}

export function getAllFromStore(dbInstance: IDBDatabase, storeName: string): Promise<any[]> {
  return new Promise((resolve) => {
    try {
      const transaction = dbInstance.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export function removeFromStore(dbInstance: IDBDatabase, storeName: string, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const transaction = dbInstance.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
}

// Dynamic database seeder
export async function seedDefaultDataIfEmpty(dbInstance: IDBDatabase): Promise<void> {
  // 1. Portfolio configurations
  const currentHero = await getByKey(dbInstance, "portfolio", "config");
  if (!currentHero) {
    const defaultHero = {
      heroName: "Ismail Ibne Ratul",
      heroTitle: "CYBER SECURITY SPECIALIST | CREATIVE DEVELOPER",
      heroBio: "A passionate Bangladeshi tech enthusiast exploring penetration testing, Linux configuration scripts, machine learning neural models, adaptive user-integ layouts, and modern full-stack infrastructures from Savar, Dhaka.",
      skills: ["CYBER SECURITY SPECIALIST", "CREATIVE DEVELOPER", "FUTURISTIC SYSTEM ARCHITECT", "LINUX POWER USER"],
      socialLinks: [
        "https://github.com/iir20",
        "https://www.facebook.com/iibnaratul",
        "im.ismail.ibna.ratul@gmail.com"
      ],
      themeColor: "green",
      animationsActive: true
    };
    await writeToStore(dbInstance, "portfolio", "config", defaultHero);
  }

  // 2. Active CV documents
  const currentCV = await getByKey(dbInstance, "portfolio", "cv");
  if (!currentCV) {
    const defaultCV = {
      fileName: "Ismail_Ibne_Ratul_CV_Primary.pdf",
      fileSize: 1240000,
      version: 1,
      lastUpdated: new Date().toISOString(),
      downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      contentType: "application/pdf",
      versionsHistory: [
        { version: 1, fileName: "Ismail_Ibne_Ratul_CV_Primary.pdf", lastUpdated: new Date().toISOString(), fileSize: 1240000 }
      ]
    };
    await writeToStore(dbInstance, "portfolio", "cv", defaultCV);
  }

  // 3. Dynamic projects nodes
  const currentProjs = await getAllFromStore(dbInstance, "projects");
  if (currentProjs.length === 0) {
    const defaultProjs = [
      {
        id: "proj-arch-rice",
        title: "Arch Linux Core Rice Configuration",
        description: "An optimized custom Linux configuration dotfile repository featuring hyper-sleek Hyprland window management, fast system-level system scripts, custom firewalls, and lightweight terminal applications.",
        features: ["Arch Linux", "Bash Scripting", "Security Hardening", "Hyprland"],
        year: "2026",
        github: "https://github.com/iir20",
        category: "Systems & OS"
      },
      {
        id: "proj-zero-trust",
        title: "Zero-Trust Packet Analyzer Tracker",
        description: "A defensive local area network scanner and packet analyzer designed to map unencrypted TCP streams, flag suspicious SSH connection queries, and visualize threat patterns in reactive diagrams.",
        features: ["Python-Scapy", "Cyber Security", "Network Forensics"],
        year: "2025",
        github: "https://github.com/iir20",
        category: "Cyber Security"
      }
    ];
    for (const proj of defaultProjs) {
      await writeToStore(dbInstance, "projects", proj.id, proj);
    }
  }

  // 4. Dynamic skills
  const currentSkills = await getAllFromStore(dbInstance, "skills");
  if (currentSkills.length === 0) {
    const defaultSkills = [
      {
        id: "skill-1",
        name: "Docker & Container Security",
        level: 80,
        cat: "Cyber Security",
        text: "Layer isolation, read-only root FS setups, minimal base alpine images compilation."
      },
      {
        id: "skill-2",
        name: "Network Traffic Analysis",
        level: 85,
        cat: "Cyber Security",
        text: "Wireshark dissection, malicious pattern profiling, alert diagnostics curation."
      }
    ];
    for (const skill of defaultSkills) {
      await writeToStore(dbInstance, "skills", skill.id, skill);
    }
  }

  // 5. Admin authentication hashing credentials
  const credentials = await getByKey(dbInstance, "settings", "credentials");
  if (!credentials) {
    // Predefined default secure hash of "cyber_security_panel_2026"
    const defaultRawPassword = "cyber_security_panel_2026";
    const hashedPass = await sha256(defaultRawPassword);
    await writeToStore(dbInstance, "settings", "credentials", {
      hashedPassword: hashedPass,
      sessionToken: null
    });
  }
}

// ----------------------------------------------------
// WORKABLE FIRESTORE ADAPTER REPLICAS (MOCK LAYER)
// ----------------------------------------------------
export class MockDocumentSnapshot {
  id: string;
  private _data: any;
  constructor(id: string, data: any) {
    this.id = id;
    this._data = data;
  }
  exists() {
    return this._data !== null && this._data !== undefined;
  }
  data() {
    return this._data;
  }
}

export class MockQuerySnapshot {
  docs: MockDocumentSnapshot[];
  empty: boolean;
  constructor(docs: MockDocumentSnapshot[]) {
    this.docs = docs;
    this.empty = docs.length === 0;
  }
}

// Mock Firestore builders
export function collection(dbDummy: any, collectionName: string) {
  return { type: "collection", name: collectionName };
}

export function doc(dbOrCol: any, ...paths: string[]) {
  if (dbOrCol && dbOrCol.type === "collection") {
    return { type: "doc", col: dbOrCol.name, id: paths[0] };
  }
  // If paths includes multiple elements like doc(db, "portfolio", "config")
  if (paths.length >= 2) {
    return { type: "doc", col: paths[0], id: paths[1] };
  }
  return { type: "doc", col: "general", id: paths[0] || "config" };
}

export async function getDoc(docRef: any): Promise<MockDocumentSnapshot> {
  const dbInstance = await openDatabase();
  await seedDefaultDataIfEmpty(dbInstance);
  
  const store = docRef.col;
  const key = docRef.id;
  const data = await getByKey(dbInstance, store, key);
  return new MockDocumentSnapshot(key, data);
}

export async function getDocs(colRef: any): Promise<MockQuerySnapshot> {
  const dbInstance = await openDatabase();
  await seedDefaultDataIfEmpty(dbInstance);
  
  const store = colRef.name;
  const items = await getAllFromStore(dbInstance, store);
  const docsList = items.map((item) => {
    const id = item.id || item.firestoreId || "item-" + Math.random().toString(36).substr(2, 6);
    return new MockDocumentSnapshot(id, item);
  });
  return new MockQuerySnapshot(docsList);
}

export async function setDoc(docRef: any, data: any): Promise<void> {
  const dbInstance = await openDatabase();
  await seedDefaultDataIfEmpty(dbInstance);
  
  const store = docRef.col;
  const key = docRef.id;
  
  const payload = { ...data };
  if (store === "projects" || store === "skills" || store === "backups" || store === "contacts" || store === "analytics") {
    if (!payload.id) payload.id = key;
    if (!payload.firestoreId) payload.firestoreId = key;
  }
  
  await writeToStore(dbInstance, store, key, payload);
}

export async function addDoc(colRef: any, data: any): Promise<MockDocumentSnapshot> {
  const dbInstance = await openDatabase();
  await seedDefaultDataIfEmpty(dbInstance);
  
  const store = colRef.name;
  const generatedId = "id-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
  const payload = { ...data, id: generatedId, firestoreId: generatedId };
  
  await writeToStore(dbInstance, store, generatedId, payload);
  return new MockDocumentSnapshot(generatedId, payload);
}

export async function deleteDoc(docRef: any): Promise<void> {
  const dbInstance = await openDatabase();
  await seedDefaultDataIfEmpty(dbInstance);
  
  const store = docRef.col;
  const key = docRef.id;
  await removeFromStore(dbInstance, store, key);
}

export async function updateDoc(docRef: any, updateFields: any): Promise<void> {
  const dbInstance = await openDatabase();
  await seedDefaultDataIfEmpty(dbInstance);
  
  const store = docRef.col;
  const key = docRef.id;
  const existing = await getByKey(dbInstance, store, key);
  const updated = { ...existing, ...updateFields };
  
  await writeToStore(dbInstance, store, key, updated);
}

export class MockBatch {
  private _ops: Array<() => Promise<void>> = [];
  set(docRef: any, data: any) {
    this._ops.push(() => setDoc(docRef, data));
  }
  delete(docRef: any) {
    this._ops.push(() => deleteDoc(docRef));
  }
  async commit(): Promise<void> {
    for (const op of this._ops) {
      await op();
    }
  }
}

export function writeBatch(dbRef: any) {
  return new MockBatch();
}

// Queries are simple proxies in static mode
export function query(colRef: any, ...queryParams: any[]) {
  return colRef;
}

export function orderBy(fieldName: string, direction?: "asc" | "desc") {
  return { type: "order", fieldName, direction };
}

// ----------------------------------------------------
// INTEGRATED SEAMLESS CLIENT AUTHENTICATORS
// ----------------------------------------------------
export async function clientSideAdminAuth(password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const dbInstance = await openDatabase();
    await seedDefaultDataIfEmpty(dbInstance);
    
    const creds = await getByKey(dbInstance, "settings", "credentials");
    if (!creds || !creds.hashedPassword) {
      return { success: false, error: "CRITICAL HANDSHAKE MISALIGNED: Credentials store uninitialized." };
    }
    
    const inputHashed = await sha256(password);
    if (creds.hashedPassword === inputHashed) {
      const token = "sess-token-" + Date.now() + "-" + Math.random().toString(36).substring(2, 10);
      
      // Cache session in database setting
      await writeToStore(dbInstance, "settings", "credentials", {
        ...creds,
        sessionToken: token
      });
      
      // Save in sessionStorage and localStorage for state restoration
      sessionStorage.setItem("ratul_admin_session", token);
      localStorage.setItem("ratul_admin_status", "ACTIVE");
      
      return { success: true };
    } else {
      return { success: false, error: "SECURITY TRIPPED: Node signature mismatch with serverless keychain." };
    }
  } catch (err) {
    return { success: false, error: "COMPILATION INTERRUPTED: Web Crypto engine fault." };
  }
}

export async function isSessionValid(): Promise<boolean> {
  try {
    const sessionToken = sessionStorage.getItem("ratul_admin_session");
    if (!sessionToken) return false;
    
    const dbInstance = await openDatabase();
    const creds = await getByKey(dbInstance, "settings", "credentials");
    
    if (creds && creds.sessionToken === sessionToken) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    const dbInstance = await openDatabase();
    const creds = await getByKey(dbInstance, "settings", "credentials");
    if (creds) {
      await writeToStore(dbInstance, "settings", "credentials", {
        ...creds,
        sessionToken: null
      });
    }
  } catch (err) {
    // Ignored
  }
  sessionStorage.removeItem("ratul_admin_session");
  localStorage.removeItem("ratul_admin_status");
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: { userId: "serverless_admin" },
    operationType,
    path
  };
  console.error("Local Database Error:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  // Always true for IndexedDB unless sandboxing entirely forbids it
  try {
    const dbInstance = await openDatabase();
    return !!dbInstance;
  } catch {
    return false;
  }
}
