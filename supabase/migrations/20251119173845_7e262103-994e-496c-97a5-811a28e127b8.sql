-- Create storage buckets for practitioner documents and media
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('practitioner-documents', 'practitioner-documents', false),
  ('practitioner-media', 'practitioner-media', true);

-- Create practitioner_documents table
CREATE TABLE public.practitioner_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('qualification', 'government_id', 'business_license', 'insurance', 'background_check', 'recommendation', 'portfolio', 'consent')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_verified BOOLEAN DEFAULT false,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create practitioner_media table
CREATE TABLE public.practitioner_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('profile_photo', 'cover_photo', 'gallery')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create verification_notes table
CREATE TABLE public.verification_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  note TEXT NOT NULL,
  action TEXT CHECK (action IN ('approved', 'rejected', 'needs_more_info', 'comment')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update practitioners table with new profile fields
ALTER TABLE public.practitioners
ADD COLUMN IF NOT EXISTS cover_photo_url TEXT,
ADD COLUMN IF NOT EXISTS services TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pricing_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS qualifications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS contact_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS profile_completeness INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}';

-- Enable RLS
ALTER TABLE public.practitioner_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for practitioner_documents
CREATE POLICY "Practitioners can view own documents"
  ON public.practitioner_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.practitioners
      WHERE practitioners.id = practitioner_documents.practitioner_id
      AND practitioners.user_id = auth.uid()
    )
  );

CREATE POLICY "Practitioners can insert own documents"
  ON public.practitioner_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.practitioners
      WHERE practitioners.id = practitioner_documents.practitioner_id
      AND practitioners.user_id = auth.uid()
    )
  );

CREATE POLICY "Practitioners can delete own documents"
  ON public.practitioner_documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.practitioners
      WHERE practitioners.id = practitioner_documents.practitioner_id
      AND practitioners.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all documents"
  ON public.practitioner_documents FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for practitioner_media
CREATE POLICY "Anyone can view media"
  ON public.practitioner_media FOR SELECT
  USING (true);

CREATE POLICY "Practitioners can manage own media"
  ON public.practitioner_media FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.practitioners
      WHERE practitioners.id = practitioner_media.practitioner_id
      AND practitioners.user_id = auth.uid()
    )
  );

-- RLS Policies for verification_notes
CREATE POLICY "Practitioners can view own verification notes"
  ON public.verification_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.practitioners
      WHERE practitioners.id = verification_notes.practitioner_id
      AND practitioners.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all verification notes"
  ON public.verification_notes FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Storage policies for practitioner-documents bucket
CREATE POLICY "Practitioners can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'practitioner-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Practitioners can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'practitioner-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Practitioners can delete own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'practitioner-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'practitioner-documents'
    AND has_role(auth.uid(), 'admin')
  );

-- Storage policies for practitioner-media bucket
CREATE POLICY "Anyone can view media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'practitioner-media');

CREATE POLICY "Practitioners can upload own media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'practitioner-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Practitioners can update own media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'practitioner-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Practitioners can delete own media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'practitioner-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Triggers for updated_at
CREATE TRIGGER update_practitioner_documents_updated_at
  BEFORE UPDATE ON public.practitioner_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_practitioner_media_updated_at
  BEFORE UPDATE ON public.practitioner_media
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();