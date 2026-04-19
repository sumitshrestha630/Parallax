export type Professional = {
  id: string;
  full_name: string;
  role: string;
  company: string;
  field: string;
  location: string | null;
  bio: string | null;
  linkedin_url: string | null;
  avatar_seed: string | null;
  priority_score?: number;
  priority_label?: string;
  priority_reason?: string;
};

export type MessageStatus = "draft" | "sent" | "replied";

export type Message = {
  id: string;
  user_id: string;
  professional_id: string;
  subject: string | null;
  body: string;
  status: MessageStatus;
  sent_at: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
};
