// Database schema and TypeScript interfaces for all tables

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  phone: string | null;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  token_expires_at: Date;
  created_at: Date;
  ip_address: string | null;
  user_agent: string | null;
}

export interface Assessment {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'active' | 'completed' | 'archived';
  assessment_type: 'skills' | 'culture_fit' | 'leadership' | 'technical' | 'general';
  total_questions: number;
  time_limit_minutes: number | null;
  passing_score: number;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
}

export interface AssessmentQuestion {
  id: string;
  assessment_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'rating_scale';
  options: string[] | null;
  correct_answer: string | null;
  points: number;
  order: number;
  created_at: Date;
}

export interface AssessmentResponse {
  id: string;
  assessment_id: string;
  respondent_email: string;
  respondent_name: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'timed_out';
  score: number | null;
  percentage: number | null;
  started_at: Date | null;
  completed_at: Date | null;
  time_taken_seconds: number | null;
  created_at: Date;
}

export interface Answer {
  id: string;
  response_id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean | null;
  points_earned: number;
  created_at: Date;
}

export interface Lead {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  phone: string | null;
  source: 'landing_page' | 'assessment_completion' | 'referral' | 'demo_request' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface APIKey {
  id: string;
  user_id: string;
  key: string;
  name: string;
  last_used_at: Date | null;
  is_active: boolean;
  created_at: Date;
}

// SQL Schema creation queries
export const SCHEMA_SQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company_name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  INDEX idx_users_email (email),
  INDEX idx_users_status (status)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(512) UNIQUE NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  INDEX idx_sessions_user_id (user_id),
  INDEX idx_sessions_token (token),
  INDEX idx_sessions_expires_at (token_expires_at)
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  assessment_type VARCHAR(30) DEFAULT 'general' CHECK (assessment_type IN ('skills', 'culture_fit', 'leadership', 'technical', 'general')),
  total_questions INTEGER DEFAULT 0,
  time_limit_minutes INTEGER,
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,
  INDEX idx_assessments_user_id (user_id),
  INDEX idx_assessments_status (status)
);

-- Assessment Questions table
CREATE TABLE IF NOT EXISTS assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(30) CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'rating_scale')),
  options JSON,
  correct_answer VARCHAR(255),
  points INTEGER DEFAULT 1,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_assessment_questions_assessment_id (assessment_id)
);

-- Assessment Responses table
CREATE TABLE IF NOT EXISTS assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  respondent_email VARCHAR(255) NOT NULL,
  respondent_name VARCHAR(255),
  status VARCHAR(30) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'timed_out')),
  score INTEGER,
  percentage DECIMAL(5, 2),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_taken_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_assessment_responses_assessment_id (assessment_id),
  INDEX idx_assessment_responses_email (respondent_email),
  INDEX idx_assessment_responses_status (status)
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES assessment_responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_answers_response_id (response_id),
  INDEX idx_answers_question_id (question_id)
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company VARCHAR(255),
  phone VARCHAR(20),
  source VARCHAR(30) DEFAULT 'landing_page' CHECK (source IN ('landing_page', 'assessment_completion', 'referral', 'demo_request', 'other')),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_leads_email (email),
  INDEX idx_leads_status (status),
  INDEX idx_leads_source (source)
);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_api_keys_user_id (user_id),
  INDEX idx_api_keys_key (key)
);
`;
