'use client';
import React, { ReactNode } from 'react';
import { ResumeBuilderState } from './types';
import { Globe, Linkedin, Github, Youtube } from 'lucide-react';

interface Props {
  data: ResumeBuilderState;
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="mb-4">
    <h2 className="mb-2 border-b border-gray-300 pb-0.5 text-[11px] font-bold tracking-widest text-gray-800 uppercase">
      {title}
    </h2>
    {children}
  </div>
);

const Bullet = ({ text }: { text: string }) => (
  <p className="flex items-start gap-1.5 text-gray-700">
    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
    {text.replace(/^[-•]\s*/, '')}
  </p>
);

export const ResumePreview = ({ data }: Props) => {
  const {
    personalInfo: p,
    socialLinks,
    summary,
    workExperience,
    skillGroups,
    languages,
    projects,
    education,
    certificates,
    hobbies,
  } = data;
  const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Your Name';
  const location = [p.city, p.state].filter(Boolean).join(', ');
  const socialIcons: Record<string, ReactNode> = {
    linkedin: <Linkedin size={11} />,
    github: <Github size={11} />,
    youtube: <Youtube size={11} />,
  };

  return (
    <div
      className="bg-white p-8 font-sans text-[11px] leading-relaxed text-gray-900"
      id="resume-print"
    >
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-[22px] font-bold">{fullName}</h1>
        {p.jobTitle && <p className="mt-0.5 text-[12px] text-gray-600">{p.jobTitle}</p>}
        <div className="mt-1 flex flex-wrap justify-center gap-x-3 text-gray-500">
          {location && <span>{location}</span>}
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
        </div>
        {socialLinks.filter((s) => s.url).length > 0 && (
          <div className="mt-1.5 flex flex-wrap justify-center gap-3">
            {socialLinks
              .filter((s) => s.url)
              .map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary flex items-center gap-1 hover:underline"
                >
                  {socialIcons[s.label.toLowerCase()] || <Globe size={11} />}
                  {s.label}
                </a>
              ))}
          </div>
        )}
      </div>

      {summary && (
        <Section title="SUMMARY">
          <p className="text-primary leading-relaxed">{summary}</p>
        </Section>
      )}

      {workExperience.length > 0 && (
        <Section title="EXPERIENCE">
          {workExperience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="font-bold">{exp.jobTitle}</p>
                  <p className="text-gray-600">{exp.companyName}</p>
                </div>
                <p className="text-[10px] whitespace-nowrap text-gray-400">
                  {exp.startDate}
                  {exp.startDate && ' — '}
                  {exp.isCurrent ? 'Present' : exp.endDate}
                </p>
              </div>
              {exp.details && (
                <div className="mt-1 space-y-0.5 pl-1">
                  {exp.details
                    .split('\n')
                    .filter(Boolean)
                    .map((l, i) => (
                      <Bullet key={i} text={l} />
                    ))}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="PROJECTS">
          {projects.map((proj) => (
            <div key={proj.id} className="mb-3">
              <div className="flex items-baseline justify-between">
                <p className="font-bold">{proj.title}</p>
                <p className="text-[10px] text-gray-400">
                  {proj.startDate}
                  {proj.startDate && ' — '}
                  {proj.endDate}
                </p>
              </div>
              {proj.details && (
                <div className="mt-0.5 space-y-0.5 pl-1">
                  {proj.details
                    .split('\n')
                    .filter(Boolean)
                    .map((l, i) => (
                      <Bullet key={i} text={l} />
                    ))}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {(skillGroups.length > 0 || languages.length > 0) && (
        <Section title="SKILLS">
          <div className="space-y-1">
            {skillGroups
              .filter((sg) => sg.skills.length > 0)
              .map((sg) => (
                <div key={sg.id} className="flex gap-2">
                  <span className="w-44 shrink-0 font-semibold text-gray-700">{sg.category}:</span>
                  <span className="text-gray-600">{sg.skills.join(', ')}</span>
                </div>
              ))}
            {languages.length > 0 && (
              <div className="flex gap-2">
                <span className="w-44 shrink-0 font-semibold text-gray-700">Languages:</span>
                <span className="text-gray-600">{languages.join(', ')}</span>
              </div>
            )}
          </div>
        </Section>
      )}

      {education.length > 0 && (
        <Section title="EDUCATION">
          {education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="font-bold">
                    {edu.degree}, {edu.institution}
                  </p>
                </div>
                <p className="text-[10px] text-gray-400">
                  {edu.startDate}
                  {edu.startDate && ' — '}
                  {edu.endDate}
                </p>
              </div>
              {edu.details && (
                <div className="mt-0.5 space-y-0.5 pl-1">
                  {edu.details
                    .split('\n')
                    .filter(Boolean)
                    .map((l, i) => (
                      <Bullet key={i} text={l} />
                    ))}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {certificates.filter((c) => c.name).length > 0 && (
        <Section title="CERTIFICATIONS">
          <p className="text-gray-700">
            {certificates
              .filter((c) => c.name)
              .map((c) => c.name)
              .join(', ')}
          </p>
        </Section>
      )}

      {hobbies && (
        <Section title="HOBBIES">
          <p className="text-gray-700">{hobbies}</p>
        </Section>
      )}
    </div>
  );
};
