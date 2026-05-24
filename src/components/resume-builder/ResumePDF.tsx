import React from 'react';
import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import { ResumeBuilderState } from './types';

const gray900 = '#111827';
const gray800 = '#1f2937';
const gray700 = '#374151';
const gray600 = '#4b5563';
const gray500 = '#6b7280';
const gray400 = '#9ca3af';
const gray300 = '#d1d5db';
const primary = '#1d4ed8';

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    backgroundColor: '#ffffff',
    paddingTop: 32,
    paddingBottom: 32,
    paddingLeft: 36,
    paddingRight: 36,
  },

  header: { textAlign: 'center', marginBottom: 14 },

  nameWrap: { marginBottom: 6 },
  name: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: gray900, textAlign: 'center' },
  jobTitleWrap: { marginBottom: 4 },
  jobTitle: { fontSize: 12, color: gray600, textAlign: 'center' },

  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },

  contactItem: { fontSize: 10, color: gray500, marginHorizontal: 4 },

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  socialLink: { fontSize: 10, color: primary, textDecoration: 'none', marginHorizontal: 5 },

  section: { marginBottom: 10 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: gray800,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    borderBottomWidth: 0.75,
    borderBottomColor: gray300,
    paddingBottom: 2,
    marginBottom: 6,
  },

  item: { marginBottom: 7 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemLeft: { flex: 1 },
  itemTitle: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: gray900 },
  itemSubtitle: { fontSize: 10, color: gray600, marginTop: 1 },
  itemDate: { fontSize: 9, color: gray400, flexShrink: 0, marginLeft: 8, textAlign: 'right' },

  bulletsWrap: { marginTop: 2 },
  bulletRow: { flexDirection: 'row', paddingLeft: 4, marginBottom: 1 },
  bulletDot: { width: 8, fontSize: 8, color: gray400, marginTop: 2 },
  bulletText: { flex: 1, fontSize: 10.5, color: gray700, lineHeight: 1.4 },

  skillRow: { flexDirection: 'row', marginBottom: 3 },
  skillLabel: {
    width: 110,
    flexShrink: 0,
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
    color: gray700,
  },
  skillValue: { flex: 1, fontSize: 10.5, color: gray600 },

  summaryText: { fontSize: 10.5, color: primary, lineHeight: 1.5 },
  plainText: { fontSize: 10.5, color: gray700 },
});

const SectionTitle = ({ title }: { title: string }) => <Text style={s.sectionTitle}>{title}</Text>;

const BulletList = ({ details }: { details: string }) => {
  const lines = details.split('\n').filter(Boolean);
  if (!lines.length) return null;
  return (
    <View style={s.bulletsWrap}>
      {lines.map((line, i) => (
        <View key={i} style={s.bulletRow}>
          <Text style={s.bulletDot}>{'•'}</Text>
          <Text style={s.bulletText}>{line.replace(/^[-•]\s*/, '')}</Text>
        </View>
      ))}
    </View>
  );
};

export const ResumePDF = ({ data }: { data: ResumeBuilderState }) => {
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
  const contactItems = [location, p.email, p.phone].filter(Boolean);
  const activeSocials = socialLinks.filter((sl) => sl.url);
  const activeSkillGroups = skillGroups.filter((sg) => sg.skills.length > 0);
  const activeCerts = certificates.filter((c) => c.name);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.nameWrap}>
            <Text style={s.name}>{fullName}</Text>
          </View>

          {p.jobTitle ? (
            <View style={s.jobTitleWrap}>
              <Text style={s.jobTitle}>{p.jobTitle}</Text>
            </View>
          ) : null}

          {contactItems.length > 0 && (
            <View style={s.contactRow}>
              {contactItems.map((item, i) => (
                <Text key={i} style={s.contactItem}>
                  {item}
                </Text>
              ))}
            </View>
          )}

          {activeSocials.length > 0 && (
            <View style={s.socialRow}>
              {activeSocials.map((sl) => (
                <Link key={sl.id} src={sl.url} style={s.socialLink}>
                  {sl.label}
                </Link>
              ))}
            </View>
          )}
        </View>

        {summary ? (
          <View style={s.section}>
            <SectionTitle title="SUMMARY" />
            <Text style={s.summaryText}>{summary}</Text>
          </View>
        ) : null}

        {workExperience.length > 0 && (
          <View style={s.section}>
            <SectionTitle title="EXPERIENCE" />
            {workExperience.map((exp) => (
              <View key={exp.id} style={s.item}>
                <View style={s.itemHeader}>
                  <View style={s.itemLeft}>
                    <Text style={s.itemTitle}>{exp.jobTitle}</Text>
                    {exp.companyName ? <Text style={s.itemSubtitle}>{exp.companyName}</Text> : null}
                  </View>
                  <Text style={s.itemDate}>
                    {exp.startDate}
                    {exp.startDate ? ' — ' : ''}
                    {exp.isCurrent ? 'Present' : exp.endDate}
                  </Text>
                </View>
                {exp.details ? <BulletList details={exp.details} /> : null}
              </View>
            ))}
          </View>
        )}

        {projects.length > 0 && (
          <View style={s.section}>
            <SectionTitle title="PROJECTS" />
            {projects.map((proj) => (
              <View key={proj.id} style={s.item}>
                <View style={s.itemHeader}>
                  <Text style={s.itemTitle}>{proj.title}</Text>
                  <Text style={s.itemDate}>
                    {proj.startDate}
                    {proj.startDate ? ' — ' : ''}
                    {proj.endDate}
                  </Text>
                </View>
                {proj.details ? <BulletList details={proj.details} /> : null}
              </View>
            ))}
          </View>
        )}

        {(activeSkillGroups.length > 0 || languages.length > 0) && (
          <View style={s.section}>
            <SectionTitle title="SKILLS" />
            {activeSkillGroups.map((sg) => (
              <View key={sg.id} style={s.skillRow}>
                <Text style={s.skillLabel}>{sg.category}:</Text>
                <Text style={s.skillValue}>{sg.skills.join(', ')}</Text>
              </View>
            ))}
            {languages.length > 0 && (
              <View style={s.skillRow}>
                <Text style={s.skillLabel}>Languages:</Text>
                <Text style={s.skillValue}>{languages.join(', ')}</Text>
              </View>
            )}
          </View>
        )}

        {education.length > 0 && (
          <View style={s.section}>
            <SectionTitle title="EDUCATION" />
            {education.map((edu) => (
              <View key={edu.id} style={s.item}>
                <View style={s.itemHeader}>
                  <Text style={s.itemTitle}>
                    {edu.degree}
                    {edu.institution ? `, ${edu.institution}` : ''}
                  </Text>
                  <Text style={s.itemDate}>
                    {edu.startDate}
                    {edu.startDate ? ' — ' : ''}
                    {edu.endDate}
                  </Text>
                </View>
                {edu.details ? <BulletList details={edu.details} /> : null}
              </View>
            ))}
          </View>
        )}

        {activeCerts.length > 0 && (
          <View style={s.section}>
            <SectionTitle title="CERTIFICATIONS" />
            <Text style={s.plainText}>{activeCerts.map((c) => c.name).join(', ')}</Text>
          </View>
        )}

        {hobbies ? (
          <View style={s.section}>
            <SectionTitle title="HOBBIES" />
            <Text style={s.plainText}>{hobbies}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
};
