/**
 * Vercel Backend API Client — replaces localStorage
 * All data is now persisted to Vercel serverless functions + Supabase
 */

const API_BASE = process.env.NODE_ENV === "production" ? "/api" : "http://localhost:3000/api";

interface ErrorRef {
  message: string;
}

// ============= Auth Operations =============

export async function authSignUp(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "sign-up", email, password }),
  });
  if (!response.ok) throw new Error("Sign up failed");
  return response.json();
}

export async function authSignIn(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "sign-in", email, password }),
  });
  if (!response.ok) throw new Error("Sign in failed");
  return response.json();
}

export async function authSignOut() {
  const response = await fetch(`${API_BASE}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "sign-out" }),
  });
  if (!response.ok) throw new Error("Sign out failed");
  return response.json();
}

export async function authGetSession() {
  const response = await fetch(`${API_BASE}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "get-session" }),
  });
  if (!response.ok) throw new Error("Get session failed");
  return response.json();
}

// ============= Freelancer Operations =============

export async function getFreelancerById(id: string) {
  const response = await fetch(`${API_BASE}/freelancers?id=${id}`);
  if (!response.ok) throw new Error("Freelancer not found");
  return response.json();
}

export async function getFreelancerByUserId(userId: string) {
  const response = await fetch(`${API_BASE}/freelancers?userId=${userId}`);
  if (!response.ok) throw new Error("Freelancer not found");
  return response.json();
}

export async function listFreelancersAll() {
  const response = await fetch(`${API_BASE}/freelancers`);
  if (!response.ok) throw new Error("Failed to fetch freelancers");
  return response.json();
}

export async function insertFreelancer(data: Record<string, unknown>) {
  const response = await fetch(`${API_BASE}/freelancers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create freelancer");
  return response.json();
}

export async function updateFreelancer(id: string, data: Record<string, unknown>) {
  const response = await fetch(`${API_BASE}/freelancers`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  });
  if (!response.ok) throw new Error("Failed to update freelancer");
  return response.json();
}

export async function deleteFreelancer(id: string) {
  const response = await fetch(`${API_BASE}/freelancers?id=${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete freelancer");
  return response.json();
}

// ============= Project Operations =============

export async function getProjectById(id: string) {
  const response = await fetch(`${API_BASE}/projects?id=${id}`);
  if (!response.ok) throw new Error("Project not found");
  return response.json();
}

export async function listProjectsByFreelancer(freelancerId: string) {
  const response = await fetch(`${API_BASE}/projects?freelancerId=${freelancerId}`);
  if (!response.ok) throw new Error("Failed to fetch projects");
  return response.json();
}

export async function listProjectsAll() {
  const response = await fetch(`${API_BASE}/projects`);
  if (!response.ok) throw new Error("Failed to fetch projects");
  return response.json();
}

export async function insertProject(data: Record<string, unknown>) {
  const response = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create project");
  return response.json();
}

export async function updateProject(id: string, data: Record<string, unknown>) {
  const response = await fetch(`${API_BASE}/projects`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  });
  if (!response.ok) throw new Error("Failed to update project");
  return response.json();
}

export async function deleteProject(id: string) {
  const response = await fetch(`${API_BASE}/projects?id=${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete project");
  return response.json();
}
