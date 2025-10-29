import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../styles/theme';

const isWeb = Platform.OS === 'web';

// Template 1: Classic Professional
export const ClassicProfessional = ({ data }) => (
  <View style={[styles.template, styles.classic]}>
    <View style={styles.classicHeader}>
      <Text style={styles.classicName}>{data.personalInfo.fullName}</Text>
      <Text style={styles.classicTitle}>{data.personalInfo.title}</Text>
      <View style={styles.classicContact}>
        <Text style={styles.classicContactText}>{data.personalInfo.email} | {data.personalInfo.phone}</Text>
        <Text style={styles.classicContactText}>{data.personalInfo.location}</Text>
      </View>
    </View>

    {data.summary && (
      <View style={styles.section}>
        <Text style={styles.classicSectionTitle}>PROFESSIONAL SUMMARY</Text>
        <Text style={styles.classicText}>{data.summary}</Text>
      </View>
    )}

    {data.experience.length > 0 && (
      <View style={styles.section}>
        <Text style={styles.classicSectionTitle}>WORK EXPERIENCE</Text>
        {data.experience.map((exp, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.classicJobTitle}>{exp.position}</Text>
            <Text style={styles.classicCompany}>{exp.company} | {exp.startDate} - {exp.endDate}</Text>
            <Text style={styles.classicText}>{exp.description}</Text>
          </View>
        ))}
      </View>
    )}

    {data.education.length > 0 && (
      <View style={styles.section}>
        <Text style={styles.classicSectionTitle}>EDUCATION</Text>
        {data.education.map((edu, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.classicJobTitle}>{edu.degree}</Text>
            <Text style={styles.classicCompany}>{edu.institution} | {edu.year}</Text>
          </View>
        ))}
      </View>
    )}

    {data.skills.length > 0 && (
      <View style={styles.section}>
        <Text style={styles.classicSectionTitle}>SKILLS</Text>
        <Text style={styles.classicText}>{data.skills.join(' • ')}</Text>
      </View>
    )}
  </View>
);

// Template 2: Modern Creative
export const ModernCreative = ({ data }) => (
  <View style={[styles.template, styles.modern]}>
    <View style={styles.modernSidebar}>
      <View style={styles.modernProfileSection}>
        <Text style={styles.modernName}>{data.personalInfo.fullName}</Text>
        <Text style={styles.modernTitle}>{data.personalInfo.title}</Text>
      </View>

      <View style={styles.modernContactSection}>
        <Text style={styles.modernSidebarTitle}>CONTACT</Text>
        <Text style={styles.modernSidebarText}>{data.personalInfo.email}</Text>
        <Text style={styles.modernSidebarText}>{data.personalInfo.phone}</Text>
        <Text style={styles.modernSidebarText}>{data.personalInfo.location}</Text>
      </View>

      {data.skills.length > 0 && (
        <View style={styles.modernContactSection}>
          <Text style={styles.modernSidebarTitle}>SKILLS</Text>
          {data.skills.map((skill, index) => (
            <Text key={index} style={styles.modernSidebarText}>• {skill}</Text>
          ))}
        </View>
      )}
    </View>

    <View style={styles.modernMain}>
      {data.summary && (
        <View style={styles.modernSection}>
          <Text style={styles.modernSectionTitle}>About Me</Text>
          <Text style={styles.modernText}>{data.summary}</Text>
        </View>
      )}

      {data.experience.length > 0 && (
        <View style={styles.modernSection}>
          <Text style={styles.modernSectionTitle}>Experience</Text>
          {data.experience.map((exp, index) => (
            <View key={index} style={styles.modernItem}>
              <Text style={styles.modernJobTitle}>{exp.position}</Text>
              <Text style={styles.modernCompany}>{exp.company}</Text>
              <Text style={styles.modernDate}>{exp.startDate} - {exp.endDate}</Text>
              <Text style={styles.modernText}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {data.education.length > 0 && (
        <View style={styles.modernSection}>
          <Text style={styles.modernSectionTitle}>Education</Text>
          {data.education.map((edu, index) => (
            <View key={index} style={styles.modernItem}>
              <Text style={styles.modernJobTitle}>{edu.degree}</Text>
              <Text style={styles.modernCompany}>{edu.institution}</Text>
              <Text style={styles.modernDate}>{edu.year}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  </View>
);

// Template 3: Minimalist Clean
export const MinimalistClean = ({ data }) => (
  <View style={[styles.template, styles.minimalist]}>
    <View style={styles.minimalistHeader}>
      <Text style={styles.minimalistName}>{data.personalInfo.fullName}</Text>
      <View style={styles.minimalistDivider} />
      <Text style={styles.minimalistContact}>
        {data.personalInfo.email} • {data.personalInfo.phone} • {data.personalInfo.location}
      </Text>
    </View>

    {data.summary && (
      <View style={styles.section}>
        <Text style={styles.minimalistText}>{data.summary}</Text>
      </View>
    )}

    {data.experience.length > 0 && (
      <View style={styles.section}>
        <Text style={styles.minimalistSectionTitle}>Experience</Text>
        {data.experience.map((exp, index) => (
          <View key={index} style={styles.minimalistItem}>
            <View style={styles.minimalistRow}>
              <Text style={styles.minimalistJobTitle}>{exp.position}</Text>
              <Text style={styles.minimalistDate}>{exp.startDate} - {exp.endDate}</Text>
            </View>
            <Text style={styles.minimalistCompany}>{exp.company}</Text>
            <Text style={styles.minimalistText}>{exp.description}</Text>
          </View>
        ))}
      </View>
    )}

    {data.education.length > 0 && (
      <View style={styles.section}>
        <Text style={styles.minimalistSectionTitle}>Education</Text>
        {data.education.map((edu, index) => (
          <View key={index} style={styles.minimalistItem}>
            <View style={styles.minimalistRow}>
              <Text style={styles.minimalistJobTitle}>{edu.degree}</Text>
              <Text style={styles.minimalistDate}>{edu.year}</Text>
            </View>
            <Text style={styles.minimalistCompany}>{edu.institution}</Text>
          </View>
        ))}
      </View>
    )}

    {data.skills.length > 0 && (
      <View style={styles.section}>
        <Text style={styles.minimalistSectionTitle}>Skills</Text>
        <Text style={styles.minimalistText}>{data.skills.join(' • ')}</Text>
      </View>
    )}
  </View>
);

// Template 4: Executive Bold
export const ExecutiveBold = ({ data }) => (
  <View style={[styles.template, styles.executive]}>
    <View style={styles.executiveHeader}>
      <Text style={styles.executiveName}>{data.personalInfo.fullName}</Text>
      <Text style={styles.executiveTitle}>{data.personalInfo.title}</Text>
      <View style={styles.executiveLine} />
      <Text style={styles.executiveContact}>
        {data.personalInfo.email} | {data.personalInfo.phone} | {data.personalInfo.location}
      </Text>
    </View>

    {data.summary && (
      <View style={styles.executiveSection}>
        <Text style={styles.executiveSectionTitle}>EXECUTIVE SUMMARY</Text>
        <View style={styles.executiveBox}>
          <Text style={styles.executiveText}>{data.summary}</Text>
        </View>
      </View>
    )}

    {data.experience.length > 0 && (
      <View style={styles.executiveSection}>
        <Text style={styles.executiveSectionTitle}>PROFESSIONAL EXPERIENCE</Text>
        {data.experience.map((exp, index) => (
          <View key={index} style={styles.executiveItem}>
            <Text style={styles.executiveJobTitle}>{exp.position}</Text>
            <Text style={styles.executiveCompany}>{exp.company}</Text>
            <Text style={styles.executiveDate}>{exp.startDate} - {exp.endDate}</Text>
            <Text style={styles.executiveText}>{exp.description}</Text>
          </View>
        ))}
      </View>
    )}

    {data.education.length > 0 && (
      <View style={styles.executiveSection}>
        <Text style={styles.executiveSectionTitle}>EDUCATION</Text>
        {data.education.map((edu, index) => (
          <View key={index} style={styles.executiveItem}>
            <Text style={styles.executiveJobTitle}>{edu.degree}</Text>
            <Text style={styles.executiveCompany}>{edu.institution} • {edu.year}</Text>
          </View>
        ))}
      </View>
    )}

    {data.skills.length > 0 && (
      <View style={styles.executiveSection}>
        <Text style={styles.executiveSectionTitle}>CORE COMPETENCIES</Text>
        <View style={styles.executiveSkillsContainer}>
          {data.skills.map((skill, index) => (
            <View key={index} style={styles.executiveSkill}>
              <Text style={styles.executiveSkillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    )}
  </View>
);

// Template 5: Tech Developer
export const TechDeveloper = ({ data }) => (
  <View style={[styles.template, styles.tech]}>
    <View style={styles.techHeader}>
      <Text style={styles.techName}>&lt;{data.personalInfo.fullName} /&gt;</Text>
      <Text style={styles.techTitle}>{data.personalInfo.title}</Text>
      <Text style={styles.techContact}>
        // {data.personalInfo.email} | {data.personalInfo.phone} | {data.personalInfo.location}
      </Text>
    </View>

    {data.skills.length > 0 && (
      <View style={styles.techSection}>
        <Text style={styles.techSectionTitle}>{'{ Technical Skills }'}</Text>
        <View style={styles.techSkillsGrid}>
          {data.skills.map((skill, index) => (
            <View key={index} style={styles.techSkillTag}>
              <Text style={styles.techSkillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    )}

    {data.experience.length > 0 && (
      <View style={styles.techSection}>
        <Text style={styles.techSectionTitle}>{'{ Experience }'}</Text>
        {data.experience.map((exp, index) => (
          <View key={index} style={styles.techItem}>
            <Text style={styles.techJobTitle}>function {exp.position.replace(/\s/g, '')}() {'{'}</Text>
            <Text style={styles.techCompany}>  company: "{exp.company}",</Text>
            <Text style={styles.techCompany}>  period: "{exp.startDate} - {exp.endDate}",</Text>
            <Text style={styles.techDescription}>  description: "{exp.description}"</Text>
            <Text style={styles.techJobTitle}>{'}'}</Text>
          </View>
        ))}
      </View>
    )}

    {data.education.length > 0 && (
      <View style={styles.techSection}>
        <Text style={styles.techSectionTitle}>{'{ Education }'}</Text>
        {data.education.map((edu, index) => (
          <View key={index} style={styles.techItem}>
            <Text style={styles.techCompany}>const education = {'{'}</Text>
            <Text style={styles.techDescription}>  degree: "{edu.degree}",</Text>
            <Text style={styles.techDescription}>  institution: "{edu.institution}",</Text>
            <Text style={styles.techDescription}>  year: {edu.year}</Text>
            <Text style={styles.techCompany}>{'};'}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
);

// Export all templates
export const RESUME_TEMPLATES = [
  { id: 1, name: 'Classic Professional', component: ClassicProfessional, category: 'Business', description: 'Traditional format for corporate roles' },
  { id: 2, name: 'Modern Creative', component: ModernCreative, category: 'Creative', description: 'Sidebar design for creative professionals' },
  { id: 3, name: 'Minimalist Clean', component: MinimalistClean, category: 'General', description: 'Simple and elegant design' },
  { id: 4, name: 'Executive Bold', component: ExecutiveBold, category: 'Executive', description: 'Strong presence for leadership roles' },
  { id: 5, name: 'Tech Developer', component: TechDeveloper, category: 'Technology', description: 'Code-themed for developers' },
  { id: 6, name: 'Academic Scholar', component: ClassicProfessional, category: 'Education', description: 'Focus on publications and research' },
  { id: 7, name: 'Healthcare Professional', component: ModernCreative, category: 'Healthcare', description: 'Clinical and caring approach' },
  { id: 8, name: 'Sales Expert', component: ExecutiveBold, category: 'Sales', description: 'Results-driven format' },
  { id: 9, name: 'Marketing Pro', component: ModernCreative, category: 'Marketing', description: 'Vibrant and engaging' },
  { id: 10, name: 'Finance Analyst', component: ClassicProfessional, category: 'Finance', description: 'Professional and precise' },
  { id: 11, name: 'Designer Portfolio', component: ModernCreative, category: 'Design', description: 'Visual and creative' },
  { id: 12, name: 'Project Manager', component: ExecutiveBold, category: 'Management', description: 'Leadership focused' },
  { id: 13, name: 'Engineering Pro', component: TechDeveloper, category: 'Engineering', description: 'Technical and detailed' },
  { id: 14, name: 'Legal Professional', component: ClassicProfessional, category: 'Legal', description: 'Formal and structured' },
  { id: 15, name: 'Consultant Expert', component: ExecutiveBold, category: 'Consulting', description: 'Problem-solving focus' },
  { id: 16, name: 'Startup Founder', component: ModernCreative, category: 'Entrepreneurship', description: 'Innovative and dynamic' },
  { id: 17, name: 'Customer Service', component: MinimalistClean, category: 'Service', description: 'Friendly and approachable' },
  { id: 18, name: 'HR Specialist', component: ClassicProfessional, category: 'HR', description: 'People-focused' },
  { id: 19, name: 'Data Scientist', component: TechDeveloper, category: 'Data Science', description: 'Analytics oriented' },
  { id: 20, name: 'Operations Manager', component: ExecutiveBold, category: 'Operations', description: 'Process driven' },
  { id: 21, name: 'Content Writer', component: MinimalistClean, category: 'Writing', description: 'Story-telling layout' },
  { id: 22, name: 'Social Media Manager', component: ModernCreative, category: 'Social Media', description: 'Trendy and modern' },
  { id: 23, name: 'Supply Chain', component: ClassicProfessional, category: 'Logistics', description: 'Systematic approach' },
  { id: 24, name: 'Quality Assurance', component: MinimalistClean, category: 'Quality', description: 'Detail-oriented' },
  { id: 25, name: 'Business Analyst', component: ExecutiveBold, category: 'Analysis', description: 'Strategic thinking' },
];

const styles = StyleSheet.create({
  template: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    minHeight: isWeb ? 1100 : 800,
    width: '100%',
  },
  section: {
    marginBottom: 16,
  },
  item: {
    marginBottom: 12,
  },

  // Classic Professional Styles
  classic: {
    padding: 24,
  },
  classicHeader: {
    borderBottomWidth: 2,
    borderBottomColor: '#2C3E50',
    paddingBottom: 12,
    marginBottom: 20,
  },
  classicName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  classicTitle: {
    fontSize: 16,
    color: '#34495E',
    marginBottom: 8,
  },
  classicContact: {
    marginTop: 4,
  },
  classicContactText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  classicSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C3E50',
    letterSpacing: 1,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#BDC3C7',
    paddingBottom: 4,
  },
  classicJobTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  classicCompany: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
    marginBottom: 4,
  },
  classicText: {
    fontSize: 12,
    color: '#34495E',
    lineHeight: 18,
  },

  // Modern Creative Styles
  modern: {
    flexDirection: 'row',
    padding: 0,
  },
  modernSidebar: {
    width: '35%',
    backgroundColor: '#2C3E50',
    padding: 20,
  },
  modernMain: {
    width: '65%',
    padding: 20,
  },
  modernProfileSection: {
    marginBottom: 24,
  },
  modernName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modernTitle: {
    fontSize: 14,
    color: '#ECF0F1',
  },
  modernContactSection: {
    marginBottom: 20,
  },
  modernSidebarTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  modernSidebarText: {
    fontSize: 11,
    color: '#ECF0F1',
    marginBottom: 4,
  },
  modernSection: {
    marginBottom: 20,
  },
  modernSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#3498DB',
    paddingBottom: 4,
  },
  modernItem: {
    marginBottom: 14,
  },
  modernJobTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
  },
  modernCompany: {
    fontSize: 12,
    color: '#3498DB',
    marginTop: 2,
  },
  modernDate: {
    fontSize: 11,
    color: '#7F8C8D',
    marginTop: 2,
    marginBottom: 4,
  },
  modernText: {
    fontSize: 11,
    color: '#34495E',
    lineHeight: 16,
  },

  // Minimalist Clean Styles
  minimalist: {
    padding: 30,
  },
  minimalistHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  minimalistName: {
    fontSize: 32,
    fontWeight: '300',
    color: '#2C3E50',
    letterSpacing: 2,
  },
  minimalistDivider: {
    width: 60,
    height: 2,
    backgroundColor: '#3498DB',
    marginVertical: 8,
  },
  minimalistContact: {
    fontSize: 11,
    color: '#7F8C8D',
  },
  minimalistSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  minimalistItem: {
    marginBottom: 12,
  },
  minimalistRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  minimalistJobTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2C3E50',
  },
  minimalistDate: {
    fontSize: 11,
    color: '#95A5A6',
  },
  minimalistCompany: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
    marginBottom: 4,
  },
  minimalistText: {
    fontSize: 12,
    color: '#34495E',
    lineHeight: 18,
  },

  // Executive Bold Styles
  executive: {
    padding: 28,
  },
  executiveHeader: {
    backgroundColor: '#34495E',
    padding: 20,
    marginBottom: 20,
    marginHorizontal: -28,
    marginTop: -28,
  },
  executiveName: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  executiveTitle: {
    fontSize: 16,
    color: '#ECF0F1',
    marginTop: 4,
  },
  executiveLine: {
    height: 3,
    backgroundColor: '#E74C3C',
    width: 80,
    marginVertical: 10,
  },
  executiveContact: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  executiveSection: {
    marginBottom: 18,
  },
  executiveSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E74C3C',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  executiveBox: {
    backgroundColor: '#ECF0F1',
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  executiveItem: {
    marginBottom: 14,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#BDC3C7',
  },
  executiveJobTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C3E50',
  },
  executiveCompany: {
    fontSize: 13,
    color: '#34495E',
    marginTop: 2,
  },
  executiveDate: {
    fontSize: 11,
    color: '#7F8C8D',
    marginTop: 2,
    marginBottom: 6,
  },
  executiveText: {
    fontSize: 12,
    color: '#34495E',
    lineHeight: 18,
  },
  executiveSkillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  executiveSkill: {
    backgroundColor: '#34495E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  executiveSkillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },

  // Tech Developer Styles
  tech: {
    backgroundColor: '#1E1E1E',
    padding: 24,
  },
  techHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#4CAF50',
    paddingBottom: 16,
    marginBottom: 20,
  },
  techName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#4CAF50',
    fontFamily: isWeb ? 'monospace' : 'Courier',
  },
  techTitle: {
    fontSize: 14,
    color: '#BBDEFB',
    marginTop: 4,
    fontFamily: isWeb ? 'monospace' : 'Courier',
  },
  techContact: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 8,
    fontFamily: isWeb ? 'monospace' : 'Courier',
  },
  techSection: {
    marginBottom: 18,
  },
  techSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF9800',
    marginBottom: 12,
    fontFamily: isWeb ? 'monospace' : 'Courier',
  },
  techSkillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techSkillTag: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
  },
  techSkillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: isWeb ? 'monospace' : 'Courier',
  },
  techItem: {
    marginBottom: 14,
    backgroundColor: '#2C2C2C',
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  techJobTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    fontFamily: isWeb ? 'monospace' : 'Courier',
  },
  techCompany: {
    fontSize: 11,
    color: '#BBDEFB',
    marginTop: 2,
    fontFamily: isWeb ? 'monospace' : 'Courier',
  },
  techDescription: {
    fontSize: 11,
    color: '#CFD8DC',
    marginTop: 2,
    fontFamily: isWeb ? 'monospace' : 'Courier',
  },
});

export default { RESUME_TEMPLATES };

