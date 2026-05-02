-- SamoTech CRM - Database Schema
-- Run this in your Neon SQL Editor

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company VARCHAR(200),
  phone VARCHAR(40),
  activities TEXT[], -- Array of service IDs
  notes TEXT,
  status VARCHAR(20) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) DEFAULT 'media', -- 'media' or 'dev'
  current_step INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'active',
  total_amount DECIMAL(12, 2) DEFAULT 0,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  script_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Voiceovers & Media Table
CREATE TABLE IF NOT EXISTS voiceovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'audio', -- 'audio' or 'video'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'Admin', 'Project Manager', 'Scriptwriter', 'Editor', 'Developer'
  specialties TEXT[],
  status VARCHAR(20) DEFAULT 'Online',
  last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, user_id)
);

-- Insert sample team members
INSERT INTO users (name, email, role, status) VALUES 
('Sidali M.', 'sidali@samotech.dz', 'Admin', 'Online'),
('Sami B.', 'sami@samotech.dz', 'Chef de Projet', 'Offline'),
('Amine K.', 'amine@samotech.dz', 'Monteur Vidéo', 'Online')
ON CONFLICT (email) DO NOTHING;
