import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import Header from '../../components/Header';
import { RESUME_TEMPLATES } from '../../components/ResumeTemplates';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Multi-step configuration
const STEPS = [
  { id: 'personal', title: 'Personal Info', icon: 'person', description: 'Tell us about yourself' },
  { id: 'summary', title: 'Summary', icon: 'document-text', description: 'Your professional summary' },
  { id: 'experience', title: 'Experience', icon: 'briefcase', description: 'Your work history' },
  { id: 'education', title: 'Education', icon: 'school', description: 'Your qualifications' },
  { id: 'skills', title: 'Skills', icon: 'bulb', description: 'Your expertise' },
];

const ResumeBuilderScreen = () => {
  const viewShotRef = useRef(null);
  const scrollRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // State for resume data
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
  });

  // UI State
  const [selectedTemplate, setSelectedTemplate] = useState(RESUME_TEMPLATES[0]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [skillInput, setSkillInput] = useState('');
  const [exporting, setExporting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Form state for experience
  const [experienceForm, setExperienceForm] = useState({
    position: '',
    company: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  // Form state for education
  const [educationForm, setEducationForm] = useState({
    degree: '',
    institution: '',
    year: '',
  });

  // Step Navigation
  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      animateProgress(newStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      animateProgress(newStep);
    }
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
    scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    animateProgress(stepIndex);
  };

  const animateProgress = (step) => {
    Animated.spring(progressAnim, {
      toValue: step,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  };

  // Check if step is completed
  const isStepCompleted = (stepIndex) => {
    const stepId = STEPS[stepIndex].id;
    
    switch (stepId) {
      case 'personal':
        const { fullName, title, email, phone } = resumeData.personalInfo;
        return !!(fullName && title && email && phone);
      case 'summary':
        return resumeData.summary.trim().length > 20;
      case 'experience':
        return resumeData.experience.length > 0;
      case 'education':
        return resumeData.education.length > 0;
      case 'skills':
        return resumeData.skills.length > 0;
      default:
        return false;
    }
  };

  // Validate current step
  const validateStep = () => {
    const currentStepId = STEPS[currentStep].id;
    
    switch (currentStepId) {
      case 'personal':
        const { fullName, title, email, phone } = resumeData.personalInfo;
        if (!fullName || !title || !email || !phone) {
          Alert.alert('Required Fields', 'Please fill in all required fields (Full Name, Title, Email, Phone)');
          return false;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Alert.alert('Invalid Email', 'Please enter a valid email address');
          return false;
        }
        break;
      case 'summary':
        if (resumeData.summary.trim().length < 20) {
          Alert.alert('Professional Summary', 'Please write a brief summary (at least 20 characters)', [
            { text: 'Skip', onPress: () => nextStep() },
            { text: 'OK' }
          ]);
          return false;
        }
        break;
      case 'experience':
        if (resumeData.experience.length === 0) {
          Alert.alert('Add Experience', 'Please add at least one work experience', [
            { text: 'Skip', onPress: () => { markStepCompleted(); nextStep(); } },
            { text: 'OK' }
          ]);
          return false;
        }
        break;
      case 'education':
        if (resumeData.education.length === 0) {
          Alert.alert('Add Education', 'Please add at least one education entry', [
            { text: 'Skip', onPress: () => { markStepCompleted(); nextStep(); } },
            { text: 'OK' }
          ]);
          return false;
        }
        break;
      case 'skills':
        if (resumeData.skills.length === 0) {
          Alert.alert('Add Skills', 'Please add at least one skill', [
            { text: 'Skip', onPress: () => { markStepCompleted(); nextStep(); } },
            { text: 'OK' }
          ]);
          return false;
        }
        break;
    }
    return true;
  };

  const markStepCompleted = () => {
    if (!completedSteps.includes(currentStep) && isStepCompleted(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      markStepCompleted();
      nextStep();
    }
  };

  // Update personal info
  const updatePersonalInfo = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  // Add experience
  const addExperience = () => {
    if (experienceForm.position && experienceForm.company) {
      setResumeData(prev => ({
        ...prev,
        experience: [...prev.experience, { ...experienceForm }],
      }));
      setExperienceForm({
        position: '',
        company: '',
        startDate: '',
        endDate: '',
        description: '',
      });
      Alert.alert('Success', 'Experience added successfully');
    } else {
      Alert.alert('Error', 'Please fill in required fields');
    }
  };

  // Remove experience
  const removeExperience = (index) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  // Add education
  const addEducation = () => {
    if (educationForm.degree && educationForm.institution) {
      setResumeData(prev => ({
        ...prev,
        education: [...prev.education, { ...educationForm }],
      }));
      setEducationForm({
        degree: '',
        institution: '',
        year: '',
      });
      Alert.alert('Success', 'Education added successfully');
    } else {
      Alert.alert('Error', 'Please fill in required fields');
    }
  };

  // Remove education
  const removeEducation = (index) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // Add skill
  const addSkill = () => {
    if (skillInput.trim()) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  // Remove skill
  const removeSkill = (index) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      setExporting(true);
      if (Platform.OS === 'web') {
        // Web export using print
        window.print();
      } else {
        // Mobile export using ViewShot
        const uri = await viewShotRef.current.capture();
        const pdfUri = `${FileSystem.documentDirectory}${resumeData.personalInfo.fullName || 'Resume'}_${Date.now()}.pdf`;
        
        // For mobile, we'd use a proper PDF library
        // For now, sharing the image
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share Resume',
          });
        }
      }
      Alert.alert('Success', 'Resume exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Error', 'Failed to export resume');
    } finally {
      setExporting(false);
    }
  };

  // Export to Word (simplified - creates formatted text)
  const exportToWord = async () => {
    try {
      setExporting(true);
      
      // Create formatted text content
      let content = `${resumeData.personalInfo.fullName}\n`;
      content += `${resumeData.personalInfo.title}\n`;
      content += `${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone}\n`;
      content += `${resumeData.personalInfo.location}\n\n`;
      
      if (resumeData.summary) {
        content += `SUMMARY\n${resumeData.summary}\n\n`;
      }
      
      if (resumeData.experience.length > 0) {
        content += `EXPERIENCE\n`;
        resumeData.experience.forEach(exp => {
          content += `${exp.position} - ${exp.company}\n`;
          content += `${exp.startDate} - ${exp.endDate}\n`;
          content += `${exp.description}\n\n`;
        });
      }
      
      if (resumeData.education.length > 0) {
        content += `EDUCATION\n`;
        resumeData.education.forEach(edu => {
          content += `${edu.degree}\n`;
          content += `${edu.institution} - ${edu.year}\n\n`;
        });
      }
      
      if (resumeData.skills.length > 0) {
        content += `SKILLS\n${resumeData.skills.join(', ')}\n`;
      }

      if (Platform.OS === 'web') {
        // Download as text file on web
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${resumeData.personalInfo.fullName || 'Resume'}.txt`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        // Share on mobile
        const fileUri = `${FileSystem.documentDirectory}${resumeData.personalInfo.fullName || 'Resume'}.txt`;
        await FileSystem.writeAsStringAsync(fileUri, content);
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        }
      }
      
      Alert.alert('Success', 'Resume exported successfully');
    } catch (error) {
      console.error('Error exporting Word:', error);
      Alert.alert('Error', 'Failed to export resume');
    } finally {
      setExporting(false);
    }
  };

  // Render template selector modal
  const renderTemplateModal = () => (
    <Modal
      visible={showTemplateModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowTemplateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Template</Text>
            <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.templateList}>
            {RESUME_TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateItem,
                  selectedTemplate.id === template.id && styles.templateItemSelected,
                ]}
                onPress={() => {
                  setSelectedTemplate(template);
                  setShowTemplateModal(false);
                }}
              >
                <View style={styles.templateIcon}>
                  <Ionicons 
                    name="document-text" 
                    size={24} 
                    color={selectedTemplate.id === template.id ? colors.primary : colors.textSecondary} 
                  />
                </View>
                <View style={styles.templateInfo}>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateCategory}>{template.category}</Text>
                  <Text style={styles.templateDescription}>{template.description}</Text>
                </View>
                {selectedTemplate.id === template.id && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Render preview modal
  const renderPreviewModal = () => (
    <Modal
      visible={showPreview}
      animationType="slide"
      onRequestClose={() => setShowPreview(false)}
    >
      <View style={styles.previewContainer}>
        <View style={styles.previewHeader}>
          <TouchableOpacity onPress={() => setShowPreview(false)}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.previewTitle}>Resume Preview</Text>
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.previewButton} onPress={exportToPDF}>
              <Ionicons name="download-outline" size={20} color={colors.textWhite} />
              <Text style={styles.previewButtonText}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewButton} onPress={exportToWord}>
              <Ionicons name="document-outline" size={20} color={colors.textWhite} />
              <Text style={styles.previewButtonText}>Word</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView style={styles.previewScroll}>
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
            {React.createElement(selectedTemplate.component, { data: resumeData })}
          </ViewShot>
        </ScrollView>
      </View>
    </Modal>
  );

  // Render Personal Info Section
  const renderPersonalInfoSection = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Full Name *"
        value={resumeData.personalInfo.fullName}
        onChangeText={(text) => updatePersonalInfo('fullName', text)}
        placeholderTextColor={colors.textLight}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Professional Title *"
        value={resumeData.personalInfo.title}
        onChangeText={(text) => updatePersonalInfo('title', text)}
        placeholderTextColor={colors.textLight}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email Address *"
        value={resumeData.personalInfo.email}
        onChangeText={(text) => updatePersonalInfo('email', text)}
        keyboardType="email-address"
        placeholderTextColor={colors.textLight}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Phone Number *"
        value={resumeData.personalInfo.phone}
        onChangeText={(text) => updatePersonalInfo('phone', text)}
        keyboardType="phone-pad"
        placeholderTextColor={colors.textLight}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Location (City, Country)"
        value={resumeData.personalInfo.location}
        onChangeText={(text) => updatePersonalInfo('location', text)}
        placeholderTextColor={colors.textLight}
      />
    </View>
  );

  // Render Summary Section
  const renderSummarySection = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Professional Summary</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Write a brief professional summary (2-3 sentences)"
        value={resumeData.summary}
        onChangeText={(text) => setResumeData(prev => ({ ...prev, summary: text }))}
        multiline
        numberOfLines={4}
        placeholderTextColor={colors.textLight}
      />
    </View>
  );

  // Render Experience Section
  const renderExperienceSection = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Work Experience</Text>
      
      {resumeData.experience.map((exp, index) => (
        <View key={index} style={styles.listItem}>
          <View style={styles.listItemContent}>
            <Text style={styles.listItemTitle}>{exp.position}</Text>
            <Text style={styles.listItemSubtitle}>{exp.company}</Text>
            <Text style={styles.listItemDate}>{exp.startDate} - {exp.endDate}</Text>
          </View>
          <TouchableOpacity onPress={() => removeExperience(index)}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      ))}
      
      <View style={styles.formCard}>
        <Text style={styles.formCardTitle}>Add New Experience</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Position Title *"
          value={experienceForm.position}
          onChangeText={(text) => setExperienceForm(prev => ({ ...prev, position: text }))}
          placeholderTextColor={colors.textLight}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Company Name *"
          value={experienceForm.company}
          onChangeText={(text) => setExperienceForm(prev => ({ ...prev, company: text }))}
          placeholderTextColor={colors.textLight}
        />
        
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Start Date (MM/YYYY)"
            value={experienceForm.startDate}
            onChangeText={(text) => setExperienceForm(prev => ({ ...prev, startDate: text }))}
            placeholderTextColor={colors.textLight}
          />
          
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="End Date (MM/YYYY)"
            value={experienceForm.endDate}
            onChangeText={(text) => setExperienceForm(prev => ({ ...prev, endDate: text }))}
            placeholderTextColor={colors.textLight}
          />
        </View>
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Job Description & Achievements"
          value={experienceForm.description}
          onChangeText={(text) => setExperienceForm(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={3}
          placeholderTextColor={colors.textLight}
        />
        
        <TouchableOpacity style={styles.addButton} onPress={addExperience}>
          <Ionicons name="add-circle" size={20} color={colors.textWhite} />
          <Text style={styles.addButtonText}>Add Experience</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Education Section
  const renderEducationSection = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Education</Text>
      
      {resumeData.education.map((edu, index) => (
        <View key={index} style={styles.listItem}>
          <View style={styles.listItemContent}>
            <Text style={styles.listItemTitle}>{edu.degree}</Text>
            <Text style={styles.listItemSubtitle}>{edu.institution}</Text>
            <Text style={styles.listItemDate}>{edu.year}</Text>
          </View>
          <TouchableOpacity onPress={() => removeEducation(index)}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      ))}
      
      <View style={styles.formCard}>
        <Text style={styles.formCardTitle}>Add Education</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Degree / Certification *"
          value={educationForm.degree}
          onChangeText={(text) => setEducationForm(prev => ({ ...prev, degree: text }))}
          placeholderTextColor={colors.textLight}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Institution Name *"
          value={educationForm.institution}
          onChangeText={(text) => setEducationForm(prev => ({ ...prev, institution: text }))}
          placeholderTextColor={colors.textLight}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Year (YYYY)"
          value={educationForm.year}
          onChangeText={(text) => setEducationForm(prev => ({ ...prev, year: text }))}
          keyboardType="numeric"
          placeholderTextColor={colors.textLight}
        />
        
        <TouchableOpacity style={styles.addButton} onPress={addEducation}>
          <Ionicons name="add-circle" size={20} color={colors.textWhite} />
          <Text style={styles.addButtonText}>Add Education</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Skills Section
  const renderSkillsSection = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Skills</Text>
      
      <View style={styles.skillsContainer}>
        {resumeData.skills.map((skill, index) => (
          <View key={index} style={styles.skillChip}>
            <Text style={styles.skillText}>{skill}</Text>
            <TouchableOpacity onPress={() => removeSkill(index)}>
              <Ionicons name="close-circle" size={18} color={colors.textWhite} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      
      <View style={styles.skillInputContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Add a skill"
          value={skillInput}
          onChangeText={setSkillInput}
          onSubmitEditing={addSkill}
          placeholderTextColor={colors.textLight}
        />
        <TouchableOpacity style={styles.skillAddButton} onPress={addSkill}>
          <Ionicons name="add" size={24} color={colors.textWhite} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Step Progress Indicator
  const renderStepProgress = () => {
    const progressWidth = progressAnim.interpolate({
      inputRange: [0, STEPS.length - 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        
        <View style={styles.stepsIndicator}>
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(index) || isStepCompleted(index);
            const isActive = index === currentStep;
            const isPast = index < currentStep;
            
            return (
              <TouchableOpacity
                key={step.id}
                style={styles.stepIndicatorWrapper}
                onPress={() => goToStep(index)}
                disabled={index > currentStep && !isCompleted}
              >
                <View
                  style={[
                    styles.stepIndicator,
                    isActive && styles.stepIndicatorActive,
                    (isPast || isCompleted) && styles.stepIndicatorCompleted,
                  ]}
                >
                  {isPast || (isCompleted && !isActive) ? (
                    <Ionicons name="checkmark-circle" size={20} color={colors.textWhite} />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        isActive && styles.stepNumberActive,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                  (isPast || isCompleted) && styles.stepLabelCompleted,
                ]}>
                  {step.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // Render Current Step Content
  const renderStepContent = () => {
    const currentStepId = STEPS[currentStep].id;
    
    switch (currentStepId) {
      case 'personal':
        return renderPersonalInfoSection();
      case 'summary':
        return renderSummarySection();
      case 'experience':
        return renderExperienceSection();
      case 'education':
        return renderEducationSection();
      case 'skills':
        return renderSkillsSection();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      
      {/* Single ScrollView wrapping all content */}
      <ScrollView
        ref={scrollRef}
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainScrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Header with Gradient */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroHeader}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Resume Builder</Text>
              <Text style={styles.heroSubtitle}>
                Step {currentStep + 1} of {STEPS.length} - {STEPS[currentStep].description}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.templateButtonHero}
              onPress={() => setShowTemplateModal(true)}
            >
              <Ionicons name="color-palette-outline" size={24} color={colors.textWhite} />
            </TouchableOpacity>
          </View>

          {/* Current Template Badge */}
          <View style={styles.templateBadge}>
            <Ionicons name="document-text" size={14} color={colors.primary} />
            <Text style={styles.templateBadgeText}>{selectedTemplate.name}</Text>
          </View>
        </LinearGradient>

        {/* Step Progress */}
        {renderStepProgress()}

        {/* Form Content */}
        <View style={styles.contentWrapper}>
          <View style={styles.stepContentCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <Ionicons name={STEPS[currentStep].icon} size={32} color={colors.primary} />
              </View>
              <View style={styles.stepHeaderText}>
                <Text style={styles.stepTitle}>{STEPS[currentStep].title}</Text>
                <Text style={styles.stepDescription}>{STEPS[currentStep].description}</Text>
              </View>
            </View>

            {renderStepContent()}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <View style={styles.navigationButtons}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={prevStep}
              >
                <Ionicons name="arrow-back" size={20} color={colors.primary} />
                <Text style={styles.navButtonTextSecondary}>Previous</Text>
              </TouchableOpacity>
            )}

            {currentStep < STEPS.length - 1 ? (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonPrimary]}
                onPress={handleNext}
              >
                <Text style={styles.navButtonTextPrimary}>Next Step</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.textWhite} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonSuccess]}
                onPress={() => setShowPreview(true)}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.textWhite} />
                <Text style={styles.navButtonTextPrimary}>Preview & Export</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {renderTemplateModal()}
      {renderPreviewModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  
  // Hero Header Styles
  heroHeader: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.lg,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.textWhite,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  templateButtonHero: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.textWhite,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  templateBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },

  // Progress Indicator Styles
  progressContainer: {
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  stepsIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepIndicatorWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  stepIndicator: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  stepIndicatorActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.md,
  },
  stepIndicatorCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepNumber: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  stepNumberActive: {
    color: colors.textWhite,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  stepLabelCompleted: {
    color: colors.success,
    fontWeight: '600',
  },

  // Content Styles
  stepContentCard: {
    margin: spacing.lg,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  stepIconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepHeaderText: {
    flex: 1,
  },
  stepTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  stepDescription: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h5,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body1,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.xs,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  formCard: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginTop: spacing.md,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  formCardTitle: {
    ...typography.h6,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    ...shadows.md,
  },
  addButtonText: {
    color: colors.textWhite,
    fontWeight: '700',
    ...typography.body1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    ...typography.body1,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  listItemSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listItemDate: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    ...shadows.sm,
  },
  skillText: {
    color: colors.textWhite,
    ...typography.body2,
    fontWeight: '600',
  },
  skillInputContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  skillAddButton: {
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },

  // Navigation Button Styles
  navigationContainer: {
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  navButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.md,
  },
  navButtonSuccess: {
    backgroundColor: colors.success,
    borderColor: colors.success,
    ...shadows.md,
  },
  navButtonTextSecondary: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '700',
  },
  navButtonTextPrimary: {
    ...typography.button,
    color: colors.textWhite,
    fontWeight: '700',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 2,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    ...typography.h4,
    fontWeight: '800',
    color: colors.text,
  },
  templateList: {
    padding: spacing.lg,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.xs,
  },
  templateItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
    ...shadows.md,
  },
  templateIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
    ...shadows.sm,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    ...typography.h6,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  templateCategory: {
    ...typography.body2,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  templateDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  
  // Preview Modal Styles
  previewContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl,
    backgroundColor: colors.cardBackground,
    ...shadows.md,
  },
  previewTitle: {
    ...typography.h4,
    fontWeight: '800',
    color: colors.text,
  },
  previewActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  previewButtonText: {
    color: colors.textWhite,
    fontWeight: '700',
    ...typography.body2,
  },
  previewScroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default ResumeBuilderScreen;
