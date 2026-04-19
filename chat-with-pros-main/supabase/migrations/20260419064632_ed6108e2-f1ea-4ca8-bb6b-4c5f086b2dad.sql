-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  college TEXT,
  major TEXT,
  grad_year TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  field TEXT NOT NULL,
  location TEXT,
  bio TEXT,
  linkedin_url TEXT,
  avatar_seed TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "professionals readable to authenticated" ON public.professionals FOR SELECT TO authenticated USING (true);

CREATE TYPE public.message_status AS ENUM ('draft','sent','replied');

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  subject TEXT,
  body TEXT NOT NULL,
  status public.message_status NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own messages select" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own messages insert" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own messages update" ON public.messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own messages delete" ON public.messages FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.professionals (full_name, role, company, field, location, bio, linkedin_url, avatar_seed) VALUES
('Maya Chen', 'Software Engineer', 'Google', 'Software Engineering', 'Mountain View, CA', 'Working on Search infra. Berkeley CS ''19. Love mentoring grads.', 'https://linkedin.com/in/mayachen', 'maya'),
('Jordan Patel', 'Product Manager', 'Stripe', 'Product Management', 'San Francisco, CA', 'PM on Payments. Penn ''20. Always happy to chat product.', 'https://linkedin.com/in/jordanp', 'jordan'),
('Sam Rivera', 'Data Scientist', 'Netflix', 'Data Science', 'Los Gatos, CA', 'Personalization team. Stats PhD. DM me about ML careers.', 'https://linkedin.com/in/samrivera', 'sam'),
('Priya Sharma', 'Software Engineer', 'Meta', 'Software Engineering', 'Menlo Park, CA', 'Instagram backend. CMU ''18. Open to coffee chats.', 'https://linkedin.com/in/priyasharma', 'priya'),
('Alex Kim', 'UX Designer', 'Apple', 'Design', 'Cupertino, CA', 'macOS design. RISD grad. Love portfolio reviews.', 'https://linkedin.com/in/alexkim', 'alex'),
('Taylor Brooks', 'Investment Banker', 'Goldman Sachs', 'Finance', 'New York, NY', 'TMT coverage. Wharton ''21. Happy to advise on banking recruiting.', 'https://linkedin.com/in/taylorbrooks', 'taylor'),
('Jamie Lopez', 'Consultant', 'McKinsey & Company', 'Consulting', 'Chicago, IL', 'Healthcare practice. HBS ''20. Down for case prep.', 'https://linkedin.com/in/jamielopez', 'jamie'),
('Riley Nguyen', 'Marketing Manager', 'Nike', 'Marketing', 'Beaverton, OR', 'Brand marketing for running. Northwestern ''19.', 'https://linkedin.com/in/rileyn', 'riley'),
('Drew Foster', 'Software Engineer', 'Amazon', 'Software Engineering', 'Seattle, WA', 'AWS Lambda team. UW ''17. Ask me anything about distributed systems.', 'https://linkedin.com/in/drewfoster', 'drew'),
('Morgan Lee', 'Investment Analyst', 'Sequoia Capital', 'Venture Capital', 'Menlo Park, CA', 'Early-stage SaaS. Stanford ''22. Love meeting founders.', 'https://linkedin.com/in/morganlee', 'morgan'),
('Casey Singh', 'Hardware Engineer', 'Tesla', 'Hardware', 'Palo Alto, CA', 'Powertrain engineering. MIT ''18.', 'https://linkedin.com/in/caseysingh', 'casey'),
('Avery Park', 'Software Engineer', 'Microsoft', 'Software Engineering', 'Redmond, WA', 'Azure compute. UIUC ''20. New grad mentor.', 'https://linkedin.com/in/averypark', 'avery');