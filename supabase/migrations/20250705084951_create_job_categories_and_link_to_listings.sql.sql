-- Step 1: Create the new table for job categories.
-- This table will act as a centralized dictionary for all job fields.
CREATE TABLE public.job_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT job_categories_pkey PRIMARY KEY (id),
  CONSTRAINT job_categories_name_key UNIQUE (name)
);

-- Optional: Add a comment to the table for clarity in database tools.
COMMENT ON TABLE public.job_categories IS 'Stores the master list of job categories for listings.';


-- Step 2: Alter the existing 'listings' table.
-- We add a new column 'category_id' to store the foreign key.
ALTER TABLE public.listings
ADD COLUMN category_id uuid;


-- Step 3: Create the foreign key relationship.
-- This ensures that every 'category_id' in 'listings' must correspond to a valid 'id' in 'job_categories'.
-- ON DELETE RESTRICT prevents deleting a category if it's still being used by any listing.
ALTER TABLE public.listings
ADD CONSTRAINT listings_category_id_fkey
FOREIGN KEY (category_id)
REFERENCES public.job_categories(id)
ON DELETE RESTRICT;