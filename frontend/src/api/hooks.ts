import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../lib/apiClient";
import type {
  Applicant,
  Application,
  ApplicationStatus,
  CandidateMatch,
  Job,
  JobMatch,
  SeekerProfile,
} from "../types";

// ---- Jobs -------------------------------------------------------------------

export function usePublishedJobs(params?: { q?: string; location?: string }) {
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Job[]>("/jobs", { params });
      return data;
    },
  });
}

export function useJob(jobId: number) {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const { data } = await apiClient.get<Job>(`/jobs/${jobId}`);
      return data;
    },
  });
}

export function useMyJobs() {
  return useQuery({
    queryKey: ["jobs", "mine"],
    queryFn: async () => {
      const { data } = await apiClient.get<Job[]>("/jobs/mine");
      return data;
    },
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.post<Job>("/jobs", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

// ---- Matching ---------------------------------------------------------------

export function useMatchedJobs() {
  return useQuery({
    queryKey: ["matching", "jobs"],
    queryFn: async () => {
      const { data } = await apiClient.get<JobMatch[]>("/matching/jobs");
      return data;
    },
  });
}

export function useMatchedCandidates(jobId: number) {
  return useQuery({
    queryKey: ["matching", "candidates", jobId],
    queryFn: async () => {
      const { data } = await apiClient.get<CandidateMatch[]>(`/matching/candidates/${jobId}`);
      return data;
    },
  });
}

// ---- Applications -----------------------------------------------------------

export function useMyApplications() {
  return useQuery({
    queryKey: ["applications", "mine"],
    queryFn: async () => {
      const { data } = await apiClient.get<Application[]>("/applications/mine");
      return data;
    },
  });
}

export function useApplyToJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { job_id: number; cover_letter?: string }) => {
      const { data } = await apiClient.post<Application>("/applications", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
  });
}

export function useApplicants(jobId: number) {
  return useQuery({
    queryKey: ["applicants", jobId],
    queryFn: async () => {
      const { data } = await apiClient.get<Applicant[]>(`/applications/job/${jobId}`);
      return data;
    },
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: ApplicationStatus }) => {
      const { data } = await apiClient.patch<Applicant>(`/applications/${id}/status`, { status });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applicants"] }),
  });
}

// ---- Profile ----------------------------------------------------------------

export function useMySeekerProfile(enabled: boolean) {
  return useQuery({
    queryKey: ["seeker-profile"],
    enabled,
    queryFn: async () => {
      const { data } = await apiClient.get<SeekerProfile>("/users/me/seeker-profile");
      return data;
    },
  });
}

export function useUpdateSeekerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.put<SeekerProfile>("/users/me/seeker-profile", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seeker-profile"] });
      qc.invalidateQueries({ queryKey: ["matching", "jobs"] });
    },
  });
}
