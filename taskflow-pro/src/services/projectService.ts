import api from "./api";

export const projectService = {
  getProjects: () => api.get("/projects"),
  getProject: (id: string) => api.get(`/projects/${id}`),
  createProject: (data: any) => api.post("/projects", data),
  updateProject: (id: string, data: any) => api.patch(`/projects/${id}`, data),
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
  addMember: (projectId: string, data: any) =>
    api.post(`/projects/${projectId}/members`, data),
  updateMember: (projectId: string, memberId: string, data: any) =>
    api.patch(`/projects/${projectId}/members/${memberId}`, data),
  removeMember: (projectId: string, memberId: string) =>
    api.delete(`/projects/${projectId}/members/${memberId}`),
  getDashboardStats: () => api.get("/dashboard"),
};
