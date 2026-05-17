import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string(),
    role: z.enum(['COMPANY', 'CANDIDATE']),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    companyName: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  location: z.string().optional(),
  isRemote: z.boolean().default(false),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  experienceMin: z.string().optional(),
  experienceMax: z.string().optional(),
  closingDate: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE']).default('ACTIVE'),
});

export const candidateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  skills: z.string().optional(),
  linkedinUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const companyProfileSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  description: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
});

export const applyJobSchema = z.object({
  resumeId: z.string().min(1, 'Please select a resume'),
  coverLetter: z.string().max(2000, 'Cover letter must be under 2000 characters').optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateJobFormData = z.input<typeof createJobSchema>;
export type CandidateProfileFormData = z.infer<typeof candidateProfileSchema>;
export type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;
export type ApplyJobFormData = z.infer<typeof applyJobSchema>;
