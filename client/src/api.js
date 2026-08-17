const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path) {
  const response = await fetch(`${API_URL}${path}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const api = {
  health: () => request("/health"),
  overview: () => request("/overview"),
  roles: () => request("/roles"),
  role: (name) => request(`/roles/${encodeURIComponent(name)}`),
  skillSearch: (q) => request(`/skills/search?q=${encodeURIComponent(q)}`),
  skill: (name) => request(`/skills/${encodeURIComponent(name)}`),
  graph: (role) => request(`/graph/role/${encodeURIComponent(role)}`)
};
