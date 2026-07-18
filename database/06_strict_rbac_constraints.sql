-- 06_strict_rbac_constraints.sql

-- 1. Create a function to validate staff assignments
CREATE OR REPLACE FUNCTION validate_staff_assignment()
RETURNS TRIGGER AS $$
DECLARE
    assigner_role VARCHAR;
    assigner_staff_role VARCHAR;
    assigner_event_id UUID;
BEGIN
    -- If assigned_by is null, we assume it's a system operation or direct DB superuser. 
    -- For safety, we will let it pass, relying on API to always provide assigned_by for user actions.
    IF NEW.assigned_by IS NULL THEN
        RETURN NEW;
    END IF;

    -- Get assigner's global role
    SELECT role INTO assigner_role FROM users WHERE id = NEW.assigned_by;

    IF assigner_role = 'super_admin' THEN
        -- Super Admin can do anything
        RETURN NEW;
    END IF;

    -- If the assigner is a regular admin, get their specific event assignment
    -- A user can only have one active assignment
    SELECT role, event_id INTO assigner_staff_role, assigner_event_id 
    FROM event_staff_assignments 
    WHERE user_id = NEW.assigned_by AND status = 'active'
    LIMIT 1;

    -- Registration Admin and Scanner Admin CANNOT assign anyone
    IF assigner_staff_role IN ('registration_admin', 'scanner_admin') THEN
        RAISE EXCEPTION 'Registration and Scanner Admins are not allowed to manage staff assignments';
    END IF;

    -- Event Admin rules
    IF assigner_staff_role = 'event_admin' THEN
        -- Event Admins can only assign staff to their OWN event
        IF NEW.event_id != assigner_event_id THEN
            RAISE EXCEPTION 'Event Admins can only manage staff for their own event';
        END IF;

        -- Event Admins CANNOT create another Event Admin
        IF NEW.role = 'event_admin' THEN
            RAISE EXCEPTION 'Event Admins cannot create or assign other Event Admins';
        END IF;
    END IF;

    -- If somehow they have no active assignment and are not super admin, block
    IF assigner_staff_role IS NULL THEN
         RAISE EXCEPTION 'Assigner does not have an active assignment or valid permissions';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Attach trigger to event_staff_assignments
DROP TRIGGER IF EXISTS trg_validate_staff_assignment ON event_staff_assignments;
CREATE TRIGGER trg_validate_staff_assignment
BEFORE INSERT OR UPDATE ON event_staff_assignments
FOR EACH ROW
EXECUTE FUNCTION validate_staff_assignment();
