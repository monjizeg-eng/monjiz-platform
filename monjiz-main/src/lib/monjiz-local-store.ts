/**
 * All app data lives in your browser (localStorage). No cloud database.
 * Clear site data / localStorage to reset. You own the data on this device.
 */
const DB_KEY = "monjiz_local_db_v1";
const SESSION_KEY = "monjiz_local_session_v1";

export type SessionUser = { id: string; email?: string };

export type Session = {
  user: SessionUser;
  access_token: string;
};

type UserRecord = { id: string; email: string; password: string };
type UserRoleRow = { id: string; user_id: string; role: string; created_at: string };
export type FreelancerRow = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  whatsapp: string;
  specialty: string;
  portfolio: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  bio: string | null;
  profile_image: string | null;
  portfolio_images: string[] | null;
  linkedin: string | null;
  behance: string | null;
  github: string | null;
};
type ProjectRow = {
  id: string;
  freelancer_id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  created_at: string;
  updated_at: string;
};
type ClientRequestRow = {
  id: string;
  freelancer_id: string;
  client_name: string;
  client_contact: string;
  message: string | null;
  project_type: string;
  budget: string;
  deadline: string;
  status: string;
  created_at: string;
};
type ProjectRequestRow = {
  id: string;
  freelancer_id: string;
  client_name: string;
  client_contact: string;
  message: string;
  status: string;
  created_at: string;
};

type Db = {
  users: UserRecord[];
  user_roles: UserRoleRow[];
  freelancers: FreelancerRow[];
  projects: ProjectRow[];
  client_requests: ClientRequestRow[];
  project_requests: ProjectRequestRow[];
};

function nowIso() {
  return new Date().toISOString();
}

/** Exposed for the query adapter; safe on SSR (returns empty). */
export function loadDb(): Db {
  if (typeof window === "undefined") {
    return emptyDb();
  }
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return seedDb();
    const parsed = JSON.parse(raw) as Db;
    if (!parsed.users || !Array.isArray(parsed.freelancers)) return seedDb();
    return parsed;
  } catch {
    return seedDb();
  }
}

function emptyDb(): Db {
  return {
    users: [],
    user_roles: [],
    freelancers: [],
    projects: [],
    client_requests: [],
    project_requests: [],
  };
}

function saveDb(db: Db) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function seedDb(): Db {
  const db = emptyDb();
  const adminId = crypto.randomUUID();
  const adminEmail =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_MONJIZ_ADMIN_EMAIL) || "admin@admin.com";
  const adminPassword =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_MONJIZ_ADMIN_PASSWORD) || "admin";

  db.users.push({ id: adminId, email: adminEmail.toLowerCase(), password: adminPassword });
  db.user_roles.push({
    id: crypto.randomUUID(),
    user_id: adminId,
    role: "admin",
    created_at: nowIso(),
  });
  saveDb(db);
  return db;
}

function getSessionSync(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

function setSession(session: Session | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

const authListeners = new Set<(event: string, session: Session | null) => void>();

function notifyAuth(event: string, session: Session | null) {
  authListeners.forEach((cb) => cb(event, session));
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

// --- Auth (Supabase-shaped responses where needed) ---

export async function authGetSession(): Promise<{ data: { session: Session | null }; error: null }> {
  return { data: { session: getSessionSync() }, error: null };
}

export async function authSignInWithPassword(credentials: {
  email: string;
  password: string;
}): Promise<{ error: { message: string } | null }> {
  const db = loadDb();
  const email = credentials.email.trim().toLowerCase();
  const user = db.users.find((u) => u.email === email && u.password === credentials.password);
  if (!user) {
    return { error: { message: "Invalid login credentials" } };
  }
  const session: Session = { user: { id: user.id, email: user.email }, access_token: "local" };
  setSession(session);
  notifyAuth("SIGNED_IN", session);
  return { error: null };
}

export async function authSignUp(args: {
  email: string;
  password: string;
}): Promise<{ data: { user: SessionUser | null; session: Session | null }; error: { message: string } | null }> {
  const db = loadDb();
  const email = args.email.trim().toLowerCase();
  if (db.users.some((u) => u.email === email)) {
    return {
      data: { user: null, session: null },
      error: { message: "User already registered" },
    };
  }
  const id = crypto.randomUUID();
  db.users.push({ id, email, password: args.password });
  if (email === "admin@admin.com") {
    db.user_roles.push({
      id: crypto.randomUUID(),
      user_id: id,
      role: "admin",
      created_at: nowIso(),
    });
  }
  saveDb(db);
  const session: Session = { user: { id, email }, access_token: "local" };
  setSession(session);
  notifyAuth("SIGNED_IN", session);
  return { data: { user: session.user, session }, error: null };
}

export async function authSignOut(): Promise<{ error: null }> {
  setSession(null);
  notifyAuth("SIGNED_OUT", null);
  return { error: null };
}

export function authOnAuthStateChange(
  callback: (event: string, session: Session | null) => void,
): { data: { subscription: { unsubscribe: () => void } } } {
  const session = getSessionSync();
  queueMicrotask(() => callback(session ? "INITIAL_SESSION" : "INITIAL_SESSION", session));
  authListeners.add(callback);
  return {
    data: {
      subscription: {
        unsubscribe: () => {
          authListeners.delete(callback);
        },
      },
    },
  };
}

// --- Tables ---

export function getUserRoles(userId: string): UserRoleRow[] {
  return loadDb().user_roles.filter((r) => r.user_id === userId);
}

export function hasAdminRole(userId: string): boolean {
  return loadDb().user_roles.some((r) => r.user_id === userId && r.role === "admin");
}

export function listFreelancersAll(): FreelancerRow[] {
  return [...loadDb().freelancers].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export function listFreelancersActiveMarketplace(): FreelancerRow[] {
  return loadDb().freelancers.filter((f) => f.status === "active" && f.bio != null && f.bio !== "");
}

export function getFreelancerById(id: string): FreelancerRow | undefined {
  return loadDb().freelancers.find((f) => f.id === id);
}

export function getFreelancerByUserId(userId: string): FreelancerRow | undefined {
  return loadDb().freelancers.find((f) => f.user_id === userId);
}

export function insertFreelancer(
  row: Omit<FreelancerRow, "created_at" | "updated_at" | "id"> & { id?: string },
): FreelancerRow {
  const db = loadDb();
  const t = nowIso();
  const full: FreelancerRow = {
    ...row,
    id: row.id ?? crypto.randomUUID(),
    created_at: t,
    updated_at: t,
  };
  db.freelancers.push(full);
  saveDb(db);
  return full;
}

export function updateFreelancer(id: string, patch: Partial<FreelancerRow>): void {
  const db = loadDb();
  const i = db.freelancers.findIndex((f) => f.id === id);
  if (i === -1) return;
  db.freelancers[i] = {
    ...db.freelancers[i],
    ...patch,
    updated_at: nowIso(),
  };
  saveDb(db);
}

export function deleteFreelancer(id: string): void {
  const db = loadDb();
  db.freelancers = db.freelancers.filter((f) => f.id !== id);
  db.projects = db.projects.filter((p) => p.freelancer_id !== id);
  db.client_requests = db.client_requests.filter((c) => c.freelancer_id !== id);
  db.project_requests = db.project_requests.filter((p) => p.freelancer_id !== id);
  saveDb(db);
}

export function listProjectsByFreelancer(freelancerId: string): ProjectRow[] {
  return loadDb()
    .projects.filter((p) => p.freelancer_id === freelancerId)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export function insertProject(
  row: Omit<ProjectRow, "created_at" | "updated_at"> & { id?: string },
): ProjectRow {
  const db = loadDb();
  const t = nowIso();
  const full: ProjectRow = {
    ...row,
    id: row.id ?? crypto.randomUUID(),
    created_at: t,
    updated_at: t,
  };
  db.projects.push(full);
  saveDb(db);
  return full;
}

export function updateProject(id: string, patch: Partial<ProjectRow>): void {
  const db = loadDb();
  const i = db.projects.findIndex((p) => p.id === id);
  if (i === -1) return;
  db.projects[i] = { ...db.projects[i], ...patch, updated_at: nowIso() };
  saveDb(db);
}

export function deleteProject(id: string): void {
  const db = loadDb();
  db.projects = db.projects.filter((p) => p.id !== id);
  saveDb(db);
}

export function listClientRequestsByFreelancer(freelancerId: string): ClientRequestRow[] {
  return loadDb()
    .client_requests.filter((c) => c.freelancer_id === freelancerId)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export function listProjectRequestsByFreelancer(freelancerId: string): ProjectRequestRow[] {
  return loadDb()
    .project_requests.filter((c) => c.freelancer_id === freelancerId)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export function insertClientRequest(
  row: Omit<ClientRequestRow, "id" | "created_at" | "status">,
): void {
  const db = loadDb();
  db.client_requests.push({
    ...row,
    id: crypto.randomUUID(),
    status: "new",
    created_at: nowIso(),
  });
  saveDb(db);
}
