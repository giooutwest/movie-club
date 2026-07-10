export type SessionStatus =
  | "gathering"
  | "spinning"
  | "result"
  | "rating_open"
  | "closed";

export type PickStatus = "pending" | "watched";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  onboarded: boolean;
  created_at: string;
}

export interface ClubMember {
  profile_id: string;
  active: boolean;
  created_at: string;
}

export interface Pick {
  id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  release_year: number | null;
  added_by: string;
  status: PickStatus;
  created_at: string;
}

export interface Session {
  id: string;
  status: SessionStatus;
  created_at: string;
}

export interface SessionMember {
  session_id: string;
  profile_id: string;
  ready: boolean;
  updated_at: string;
}

export interface SessionResult {
  session_id: string;
  winning_pick_id: string;
  seed: number;
  decided_at: string;
}

export interface Rating {
  id: string;
  session_id: string;
  pick_id: string;
  profile_id: string;
  score: number;
  review_text: string;
  created_at: string;
}
