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
  })
  .refine((d) => d.role !== 'CANDIDATE' || (d.firstName && d.firstName.trim().length > 0), {
    message: 'First name is required',
    path: ['firstName'],
  })
  .refine((d) => d.role !== 'CANDIDATE' || (d.lastName && d.lastName.trim().length > 0), {
    message: 'Last name is required',
    path: ['lastName'],
  })
  .refine((d) => d.role !== 'COMPANY' || (d.companyName && d.companyName.trim().length > 0), {
    message: 'Company name is required',
    path: ['companyName'],
  });

const optionalPositiveNum = z
  .string()
  .optional()
  .refine((v) => !v || (!isNaN(Number(v)) && Number(v) > 0), {
    message: 'Must be a positive number',
  });

const optionalNonNegNum = z
  .string()
  .optional()
  .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), {
    message: 'Cannot be negative',
  });

export const createJobSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be under 100 characters'),
    description: z.string().min(50, 'Description must be at least 50 characters'),
    location: z.string().optional(),
    isRemote: z.boolean().default(false),
    salaryMin: optionalPositiveNum,
    salaryMax: optionalPositiveNum,
    experienceMin: optionalNonNegNum,
    experienceMax: optionalNonNegNum,

    closingDate: z
      .string()
      .optional()
      .refine((v) => !v || !isNaN(new Date(v).getTime()), { message: 'Invalid date' })
      .refine((v) => !v || new Date(v) > new Date(), {
        message: 'Closing date must be in the future',
      }),
    status: z.enum(['DRAFT', 'ACTIVE']).default('ACTIVE'),
  })
  .refine(
    (d) => {
      if (!d.salaryMin || !d.salaryMax) return true;
      return Number(d.salaryMin) <= Number(d.salaryMax);
    },
    { message: 'Min salary cannot exceed max salary', path: ['salaryMax'] }
  )
  .refine(
    (d) => {
      if (!d.experienceMin || !d.experienceMax) return true;
      return Number(d.experienceMin) <= Number(d.experienceMax);
    },
    { message: 'Min experience cannot exceed max experience', path: ['experienceMax'] }
  );

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
