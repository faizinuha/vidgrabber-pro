-- Create table for storing donations
CREATE TABLE public.donations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    supporter_name TEXT,
    supporter_email TEXT,
    amount INTEGER NOT NULL DEFAULT 0,
    message TEXT,
    unit TEXT DEFAULT 'gulali',
    order_id TEXT UNIQUE,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Public read for verification
CREATE POLICY "Allow public read for verified donations" 
ON public.donations 
FOR SELECT 
USING (verified = true);

-- Allow insert from service role (edge function)
CREATE POLICY "Allow insert from service role" 
ON public.donations 
FOR INSERT 
WITH CHECK (true);

-- Table for storing 4K access tokens
CREATE TABLE public.access_tokens (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '365 days')
);

-- Enable RLS
ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;

-- Public read for token verification
CREATE POLICY "Allow public token verification" 
ON public.access_tokens 
FOR SELECT 
USING (true);

-- Allow insert from service role
CREATE POLICY "Allow insert from service role" 
ON public.access_tokens 
FOR INSERT 
WITH CHECK (true);