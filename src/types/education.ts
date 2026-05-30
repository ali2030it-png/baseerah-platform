export type Region = {
  id: string;
  name: string;
};

export type School = {
  id: string;
  region_id: string | null;
  name: string;
  school_code: string | null;
  stage: string | null;
  gender: string | null;
};

export type ProfileStatus =
  | "pending"
  | "active"
  | "rejected"
  | "suspended";

export type ProfileRole =
  | "super_admin"
  | "school_principal_male"
  | "school_principal_female"
  | "teacher_male"
  | "teacher_female"
  | "counselor_male"
  | "counselor_female";

export type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  role: ProfileRole;
  status: ProfileStatus;
  region_id: string | null;
  school_id: string | null;
};
