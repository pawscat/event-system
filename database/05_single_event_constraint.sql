-- 1. Create a new ENUM for assignment status
CREATE TYPE assignment_status AS ENUM ('active', 'inactive');

-- 2. Add status to event_staff_assignments
ALTER TABLE event_staff_assignments 
ADD COLUMN status assignment_status NOT NULL DEFAULT 'active';

-- 3. Remove the old UNIQUE constraint which allows multiple active assignments across different events
ALTER TABLE event_staff_assignments 
DROP CONSTRAINT IF EXISTS event_staff_assignments_event_id_user_id_key;

-- 4. Create the new partial unique index
-- This ensures a user can only have ONE 'active' assignment across ALL events
CREATE UNIQUE INDEX unique_active_assignment_per_user 
ON event_staff_assignments(user_id) 
WHERE status = 'active';
