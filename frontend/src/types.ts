export type UserRole = "seeker" | "employer";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
}

export interface Skill {
  id: number;
  name: string;
  slug: string;
  category: string | null;
}

export interface SeekerSkill {
  skill: Skill;
  proficiency: number;
}

export interface JobSkill {
  skill: Skill;
  importance: number;
  is_required: boolean;
}

export interface Institution {
  id: number;
  name: string;
  email_domain: string;
  location: string | null;
}

export interface SeekerProfile {
  id: number;
  full_name: string;
  headline: string | null;
  bio: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  field_of_study: string | null;
  graduation_year: number | null;
  is_institution_verified: boolean;
  institution: Institution | null;
  skills: SeekerSkill[];
}

export interface EmployerSummary {
  id: number;
  company_name: string;
  is_verified: boolean;
}

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "internship"
  | "contract"
  | "graduate_trainee";

export type ExperienceLevel = "entry" | "junior" | "mid";

export type JobStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "closed";

export interface Job {
  id: number;
  title: string;
  description: string;
  location: string | null;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  min_experience_years: number;
  status: JobStatus;
  employer: EmployerSummary;
  skills: JobSkill[];
}

export interface MatchBreakdown {
  matched_skills: string[];
  missing_required_skills: string[];
  missing_optional_skills: string[];
}

export interface JobMatch {
  job: Job;
  match_score: number;
  breakdown: MatchBreakdown;
}

export interface CandidateMatch {
  seeker: SeekerProfile;
  match_score: number;
  breakdown: MatchBreakdown;
}

export type ApplicationStatus =
  | "applied"
  | "reviewed"
  | "shortlisted"
  | "rejected"
  | "hired";

export interface Application {
  id: number;
  status: ApplicationStatus;
  cover_letter: string | null;
  match_score: number | null;
  job: Job;
}

export interface Applicant {
  id: number;
  status: ApplicationStatus;
  cover_letter: string | null;
  match_score: number | null;
  seeker: SeekerProfile;
}
