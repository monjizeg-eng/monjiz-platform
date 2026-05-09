import {
  authGetSession,
  authOnAuthStateChange,
  authSignInWithPassword,
  authSignOut,
  authSignUp,
  deleteFreelancer,
  deleteProject,
  fileToDataUrl,
  getFreelancerById,
  getFreelancerByUserId,
  insertClientRequest,
  insertFreelancer,
  insertProject,
  listClientRequestsByFreelancer,
  listFreelancersActiveMarketplace,
  listFreelancersAll,
  listProjectRequestsByFreelancer,
  listProjectsByFreelancer,
  loadDb,
  updateFreelancer,
  updateProject,
  type FreelancerRow,
} from "@/lib/monjiz-local-store";

type ErrorRef = { message: string } | null;

const urlMap = new Map<string, string>();

function sortCreated<T extends { created_at: string }>(rows: T[], ascending: boolean): T[] {
  return [...rows].sort((a, b) =>
    ascending ? +new Date(a.created_at) - +new Date(b.created_at) : +new Date(b.created_at) - +new Date(a.created_at),
  );
}

abstract class Thenable<TData> {
  abstract run(): Promise<{ data: TData; error: ErrorRef }>;
  then<TResult1 = { data: TData; error: ErrorRef }, TResult2 = never>(
    onfulfilled?: (value: { data: TData; error: ErrorRef }) => TResult1 | PromiseLike<TResult1>,
  ): Promise<TResult1 | TResult2> {
    return this.run().then(onfulfilled as (v: { data: TData; error: ErrorRef }) => TResult1) as Promise<TResult1 | TResult2>;
  }
}

class SelectMany<T extends Record<string, unknown>> extends Thenable<T[] | null> {
  protected rows: T[];

  constructor(rows: T[]) {
    super();
    this.rows = rows;
  }

  select(_cols?: string) {
    return this;
  }

  eq(col: keyof T & string, val: unknown) {
    this.rows = this.rows.filter((r) => r[col] === val);
    return this;
  }

  not(col: keyof T & string, op: string, val: unknown) {
    if (op === "is" && val === null) {
      this.rows = this.rows.filter((r) => r[col] != null && r[col] !== "");
    }
    return this;
  }

  order(_col: string, opts: { ascending?: boolean }) {
    const asc = opts.ascending !== false;
    this.rows = sortCreated(this.rows as { created_at: string }[], asc) as T[];
    return this;
  }

  limit(n: number) {
    this.rows = this.rows.slice(0, n);
    return this;
  }

  async maybeSingle(): Promise<{ data: T | null; error: ErrorRef }> {
    return { data: this.rows[0] ?? null, error: null };
  }

  async run() {
    return { data: this.rows, error: null };
  }
}

class InsertResult extends Thenable<null> {
  async run() {
    return { data: null, error: null };
  }
}

class ProjectsInsertChain {
  constructor(private row: Parameters<typeof insertProject>[0]) {}

  select(_cols?: string) {
    return this;
  }

  async single(): Promise<{ data: ReturnType<typeof insertProject> | null; error: ErrorRef }> {
    const created = insertProject(this.row);
    return { data: created, error: null };
  }
}

class UpdateQuery extends Thenable<null> {
  private idVal?: string;

  constructor(
    private table: string,
    private patch: Record<string, unknown>,
  ) {
    super();
  }

  eq(col: string, val: unknown) {
    if (col === "id") this.idVal = String(val);
    return this;
  }

  async run() {
    if (this.table === "freelancers" && this.idVal) {
      updateFreelancer(this.idVal, this.patch as Partial<FreelancerRow>);
    } else if (this.table === "projects" && this.idVal) {
      updateProject(this.idVal, this.patch as Parameters<typeof updateProject>[1]);
    }
    return { data: null, error: null };
  }
}

class DeleteQuery extends Thenable<null> {
  private idVal?: string;

  constructor(private table: string) {
    super();
  }

  eq(col: string, val: unknown) {
    if (col === "id") this.idVal = String(val);
    return this;
  }

  async run() {
    if (this.table === "freelancers" && this.idVal) deleteFreelancer(this.idVal);
    if (this.table === "projects" && this.idVal) deleteProject(this.idVal);
    return { data: null, error: null };
  }
}

function fromTable(table: string) {
  const db = loadDb();

  return {
    select(cols?: string) {
      if (table === "freelancers") {
        return new SelectMany(db.freelancers as unknown as Record<string, unknown>[]).select(
          cols,
        ) as unknown as SelectMany<FreelancerRow>;
      }
      if (table === "user_roles") {
        return new SelectMany(db.user_roles as unknown as Record<string, unknown>[]);
      }
      if (table === "projects") {
        return new SelectMany(db.projects as unknown as Record<string, unknown>[]);
      }
      if (table === "client_requests") {
        return new SelectMany(db.client_requests as unknown as Record<string, unknown>[]);
      }
      if (table === "project_requests") {
        return new SelectMany(db.project_requests as unknown as Record<string, unknown>[]);
      }
      return new SelectMany([]);
    },

    insert(row: Record<string, unknown>) {
      if (table === "freelancers") {
        insertFreelancer(row as Parameters<typeof insertFreelancer>[0]);
        return new InsertResult();
      }
      if (table === "projects") {
        return new ProjectsInsertChain(row as Parameters<typeof insertProject>[0]);
      }
      if (table === "client_requests") {
        const r = row as {
          freelancer_id: string;
          client_name: string;
          client_contact: string;
          message?: string | null;
          project_type: string;
          budget: string;
          deadline: string;
        };
        insertClientRequest({
          freelancer_id: r.freelancer_id,
          client_name: r.client_name,
          client_contact: r.client_contact,
          message: r.message ?? null,
          project_type: r.project_type,
          budget: r.budget,
          deadline: r.deadline,
        });
        return new InsertResult();
      }
      return new InsertResult();
    },

    update(patch: Record<string, unknown>) {
      return new UpdateQuery(table, patch);
    },

    delete() {
      return new DeleteQuery(table);
    },
  };
}

/** Browser-local persistence (no Supabase). Same API shape as before for minimal churn. */
export const localDb = {
  auth: {
    getSession: authGetSession,
    signInWithPassword: authSignInWithPassword,
    signUp: authSignUp,
    signOut: authSignOut,
    onAuthStateChange: authOnAuthStateChange,
  },
  from: fromTable,
  storage: {
    from(_bucket: string) {
      return {
        upload: async (path: string, file: File, _opts?: object) => {
          const url = await fileToDataUrl(file);
          urlMap.set(path, url);
          return { error: null };
        },
        getPublicUrl: (path: string) => ({
          data: { publicUrl: urlMap.get(path) ?? "" },
        }),
      };
    },
  },
};

export function dashboardBundle(userId: string) {
  const f = getFreelancerByUserId(userId);
  if (!f) {
    return {
      profile: null as FreelancerRow | null,
      requests: [] as Array<Record<string, unknown> & { created_at: string }>,
      projects: [] as ReturnType<typeof listProjectsByFreelancer>,
    };
  }
  const cr = listClientRequestsByFreelancer(f.id);
  const pr = listProjectRequestsByFreelancer(f.id);
  const requests = [...cr, ...pr].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  return { profile: f, requests, projects: listProjectsByFreelancer(f.id) };
}

export function adminAllFreelancers() {
  return listFreelancersAll();
}

export function profilePublic(id: string) {
  const f = getFreelancerById(id);
  if (!f || f.status !== "active") return { freelancer: null as FreelancerRow | null, projects: [] };
  return { freelancer: f, projects: listProjectsByFreelancer(id) };
}
