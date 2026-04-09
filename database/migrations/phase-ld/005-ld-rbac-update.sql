-- Migration 005: Update Corporate RBAC roles and User types
-- UP
ALTER TABLE users 
MODIFY COLUMN user_type ENUM('student','teacher','institute','parent','mentor','corporate_admin','corporate_user','professional_learner','organization') NOT NULL;

ALTER TABLE ld_org_members
MODIFY COLUMN org_role ENUM('super_admin','ld_admin','manager','instructor','learner','hr','owner') NOT NULL DEFAULT 'learner';

-- Add parent_role_id to support custom hierarchies in job roles
ALTER TABLE ld_roles
ADD COLUMN parent_role_id INT UNSIGNED DEFAULT NULL AFTER org_id,
ADD CONSTRAINT fk_role_parent FOREIGN KEY (parent_role_id) REFERENCES ld_roles(id) ON DELETE SET NULL;

-- DOWN
-- ALTER TABLE users MODIFY COLUMN user_type ENUM('student','teacher','institute','parent','mentor') NOT NULL;
-- ALTER TABLE ld_org_members MODIFY COLUMN org_role ENUM('owner','ld_admin','manager','sme','learner') NOT NULL DEFAULT 'learner';
-- ALTER TABLE ld_roles DROP FOREIGN KEY fk_role_parent, DROP COLUMN parent_role_id;
