-- Run this ONCE in your PostgreSQL SQL editor if the app expects column `grade`
-- but your database still has JSON column `grades` from the multi-subject experiment.
-- Safe to run only when `grades` exists; otherwise it does nothing.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_class c ON a.attrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND c.relname = 'Student'
      AND a.attname = 'grades'
      AND NOT a.attisdropped
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_attribute a
      JOIN pg_class c ON a.attrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public'
        AND c.relname = 'Student'
        AND a.attname = 'grade'
        AND NOT a.attisdropped
    ) THEN
      ALTER TABLE "Student" ADD COLUMN "grade" TEXT;
    END IF;

    UPDATE "Student"
    SET "grade" = COALESCE(
      (
        SELECT elem->>'value'
        FROM jsonb_array_elements(COALESCE("grades"::jsonb, '[]'::jsonb)) AS elem
        WHERE elem->>'subject' = 'Grade'
        LIMIT 1
      ),
      (COALESCE("grades"::jsonb, '[]'::jsonb)->0->>'value'),
      '—'
    )
    WHERE "grade" IS NULL;

    ALTER TABLE "Student" ALTER COLUMN "grade" SET NOT NULL;
    ALTER TABLE "Student" DROP COLUMN "grades";
  END IF;
END $$;
