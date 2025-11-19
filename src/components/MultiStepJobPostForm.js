import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';
import { formSteps } from '../data/jobPostFormConfig';
import { INDUSTRIES_DATA, getSubIndustries } from '../data/industriesData';
import { DEPARTMENTS_DATA, getSubDepartments } from '../data/departmentsData';
import {
  BASIC_EDUCATION_LEVELS,
  ITI_COURSE_OPTIONS,
  ITI_SPECIALIZATION_OPTIONS,
  DIPLOMA_COURSE_OPTIONS,
  DIPLOMA_SPECIALIZATION_OPTIONS,
  GRADUATE_COURSE_OPTIONS,
  GRADUATE_SPECIALIZATION_OPTIONS,
  POST_GRADUATE_COURSE_OPTIONS,
  POST_GRADUATE_SPECIALIZATION_OPTIONS,
  DOCTORATE_COURSE_OPTIONS,
  DOCTORATE_SPECIALIZATION_OPTIONS,
} from '../data/educationData';
import Input from './Input';
import DropdownField from './FormFields/DropdownField';
import MultiSelectField from './FormFields/MultiSelectField';
import AutoCompleteField from './FormFields/AutoCompleteField';
import CheckboxField from './FormFields/CheckboxField';
import TimePickerField from './FormFields/TimePickerField';
import WeekDaysField from './FormFields/WeekDaysField';
import QuestionBuilderField from './FormFields/QuestionBuilderField';
import Button from './Button';

const MultiStepJobPostForm = ({ onSubmit, initialData = {}, onCancel, onChange, initialStep = 0, enableAutosave = false, autosaveKey = null }) => {
  const [currentStep, setCurrentStep] = useState(initialStep || 0);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollViewRef = useRef(null);

  const currentStepData = formSteps[currentStep];
  const isLastStep = currentStep === formSteps.length - 1;
  const isFirstStep = currentStep === 0;

  // Notify changes and autosave
  const notifyChange = async (nextData, nextStep = currentStep) => {
    if (onChange) {
      try { onChange(nextData, nextStep); } catch (_) {}
    }
    if (enableAutosave && autosaveKey) {
      try {
        const payload = { formData: nextData, currentStep: nextStep, updatedAt: Date.now() };
        // Defer import to avoid cyclic deps
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        await AsyncStorage.setItem(autosaveKey, JSON.stringify(payload));
      } catch (e) {
        // ignore autosave errors
      }
    }
  };

  // Update form field value
  const handleFieldChange = (fieldName, value) => {
    setFormData((prev) => {
      const next = { ...prev, [fieldName]: value };
      notifyChange(next);
      return next;
    });
    
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    // Clear dependent fields when parent field changes
    if (fieldName === 'industries') {
      setFormData((prev) => ({ ...prev, subIndustries: [] }));
    }
    if (fieldName === 'departments') {
      setFormData((prev) => ({ ...prev, subDepartments: [] }));
    }
    if (fieldName === 'educationLevel') {
      setFormData((prev) => ({ ...prev, course: [], specialization: [] }));
    }
    if (fieldName === 'course') {
      setFormData((prev) => ({ ...prev, specialization: [] }));
    }
    if (fieldName === 'disabilityStatus') {
      setFormData((prev) => ({ ...prev, disabilityTypes: [] }));
    }
  };

  // Get dynamic options for dependent fields
  const getDynamicOptions = (field) => {
    // Helper function to normalize strings for comparison
    const normalizeValue = (str) => {
      if (!str) return '';
      // Convert to lowercase, replace spaces and slashes with underscore, remove consecutive underscores
      return str
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')  // Replace spaces with underscore
        .replace(/\//g, '_')    // Replace slashes with underscore
        .replace(/_+/g, '_')    // Replace consecutive underscores with single
        .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
    };

    // Handle sub-industries based on selected industries
    if (field.name === 'subIndustries' && field.dependsOn === 'industries') {
      const selectedIndustries = formData.industries || [];
      if (selectedIndustries.length === 0) {
        return [];
      }
      
      console.log('Selected industry values:', selectedIndustries);
      
      // Get industry labels from values
      const industryLabels = [];
      selectedIndustries.forEach(item => {
        const industry = INDUSTRIES_DATA.find(ind => {
          const normalizedName = normalizeValue(ind.industry);
          const itemValue = typeof item === 'string' ? item : item.value;
          console.log(`Comparing: "${normalizedName}" === "${itemValue}"`);
          return normalizedName === itemValue;
        });
        if (industry) {
          industryLabels.push(industry.industry);
        }
      });

      console.log('Industry labels found:', industryLabels);

      // Get sub-industries for selected industries
      const subIndustries = getSubIndustries(industryLabels);
      console.log('Sub-industries returned:', subIndustries);
      
      return subIndustries.map(subInd => ({
        value: normalizeValue(subInd),
        label: subInd,
      }));
    }

    // Handle sub-departments based on selected departments
    if (field.name === 'subDepartments' && field.dependsOn === 'departments') {
      const selectedDepartments = formData.departments || [];
      if (selectedDepartments.length === 0) {
        return [];
      }
      
      console.log('Selected department values:', selectedDepartments);
      
      // Get department labels from values
      const departmentLabels = [];
      selectedDepartments.forEach(item => {
        const department = DEPARTMENTS_DATA.find(dept => {
          const normalizedName = normalizeValue(dept.department);
          const itemValue = typeof item === 'string' ? item : item.value;
          console.log(`Comparing: "${normalizedName}" === "${itemValue}"`);
          return normalizedName === itemValue;
        });
        if (department) {
          departmentLabels.push(department.department);
        }
      });

      console.log('Department labels found:', departmentLabels);

      // Get sub-departments for selected departments
      const subDepartments = getSubDepartments(departmentLabels);
      console.log('Sub-departments returned:', subDepartments);
      
      return subDepartments.map(subDept => ({
        value: normalizeValue(subDept),
        label: subDept,
      }));
    }

    // Handle course options based on selected education levels
    if (field.name === 'course' && field.dependsOn === 'educationLevel') {
      const selectedLevels = formData.educationLevel || [];
      if (selectedLevels.length === 0) {
        return [];
      }

      // Check if only basic education levels are selected
      const levelLabels = selectedLevels.map(item => {
        const itemValue = typeof item === 'string' ? item : item.value;
        return itemValue.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      });

      const onlyBasicEducation = levelLabels.every(level => BASIC_EDUCATION_LEVELS.includes(level));
      if (onlyBasicEducation) {
        return [];
      }

      // Collect course options based on selected levels
      let courseOptions = [];
      levelLabels.forEach(level => {
        if (level === 'ITI') {
          courseOptions = [...courseOptions, ...ITI_COURSE_OPTIONS];
        } else if (level === 'Diploma') {
          courseOptions = [...courseOptions, ...DIPLOMA_COURSE_OPTIONS];
        } else if (level === 'Graduate') {
          courseOptions = [...courseOptions, ...GRADUATE_COURSE_OPTIONS];
        } else if (level === 'Post Graduate') {
          courseOptions = [...courseOptions, ...POST_GRADUATE_COURSE_OPTIONS];
        } else if (level === 'Doctorate') {
          courseOptions = [...courseOptions, ...DOCTORATE_COURSE_OPTIONS];
        }
      });

      // Remove duplicates
      courseOptions = [...new Set(courseOptions)];
      
      return courseOptions.map(course => ({
        value: course.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_').replace(/\./g, '').replace(/\(/g, '').replace(/\)/g, ''),
        label: course,
      }));
    }

    // Handle specialization options based on selected courses
    if (field.name === 'specialization' && field.dependsOn === 'course') {
      const selectedCourses = formData.course || [];
      if (selectedCourses.length === 0) {
        return [];
      }

      // Get course labels from values
      const courseLabels = selectedCourses.map(item => {
        const itemValue = typeof item === 'string' ? item : item.value;
        return itemValue.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ').replace(/_/g, ' ');
      });

      // Collect specialization options based on selected courses
      let specializationOptions = [];
      courseLabels.forEach(course => {
        // Check if course belongs to ITI
        if (ITI_COURSE_OPTIONS.includes(course)) {
          specializationOptions = [...specializationOptions, ...ITI_SPECIALIZATION_OPTIONS];
        }
        // Check if course belongs to Diploma
        else if (DIPLOMA_COURSE_OPTIONS.includes(course)) {
          specializationOptions = [...specializationOptions, ...DIPLOMA_SPECIALIZATION_OPTIONS];
        }
        // Check if course belongs to Graduate
        else if (GRADUATE_COURSE_OPTIONS.includes(course)) {
          specializationOptions = [...specializationOptions, ...GRADUATE_SPECIALIZATION_OPTIONS];
        }
        // Check if course belongs to Post Graduate
        else if (POST_GRADUATE_COURSE_OPTIONS.includes(course)) {
          specializationOptions = [...specializationOptions, ...POST_GRADUATE_SPECIALIZATION_OPTIONS];
        }
        // Check if course belongs to Doctorate
        else if (DOCTORATE_COURSE_OPTIONS.includes(course)) {
          specializationOptions = [...specializationOptions, ...DOCTORATE_SPECIALIZATION_OPTIONS];
        }
      });

      // Remove duplicates
      specializationOptions = [...new Set(specializationOptions)];
      
      return specializationOptions.map(spec => ({
        value: spec.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_').replace(/\./g, '').replace(/\(/g, '').replace(/\)/g, '').replace(/&/g, 'and').replace(/'/g, ''),
        label: spec,
      }));
    }

    return field.options || [];
  };

  // Validate current step
  const validateCurrentStep = () => {
    const newErrors = {};
    const currentFields = currentStepData.fields;

    currentFields.forEach((field) => {
      // Skip validation if field depends on another field that is false
      if (field.dependsOn && !formData[field.dependsOn]) {
        return;
      }

      // Skip validation if field has a showWhen condition that doesn't match
      if (field.dependsOn && field.showWhen) {
        const parentValue = formData[field.dependsOn];
        const parentValueKey = typeof parentValue === 'object' && parentValue?.value 
          ? parentValue.value 
          : parentValue;
        
        if (parentValueKey !== field.showWhen) {
          return;
        }
      }

      if (field.required) {
        const value = formData[field.name];
        
        if (!value || (Array.isArray(value) && value.length === 0) || value === '') {
          newErrors[field.name] = `${field.label} is required`;
        }
      }

      // Additional validation for specific field types
      if (field.type === 'email' && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Please enter a valid email address';
        }
      }

      if (field.type === 'tel' && formData[field.name]) {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData[field.name].replace(/[^0-9]/g, ''))) {
          newErrors[field.name] = 'Please enter a valid phone number';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate to next step
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (isLastStep) {
        handleSubmit();
      } else {
        setCurrentStep((prev) => prev + 1);
        notifyChange(formData, currentStep + 1);
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }
    } else {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => {
        const next = prev - 1;
        notifyChange(formData, next);
        return next;
      });
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  // Jump to specific step
  const jumpToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render individual field based on type
  const renderField = (field) => {
    // Skip field if it depends on another field that is false
    if (field.dependsOn && !formData[field.dependsOn]) {
      return null;
    }

    // Skip field if it has a showWhen condition that doesn't match
    if (field.dependsOn && field.showWhen) {
      const parentValue = formData[field.dependsOn];
      const parentValueKey = typeof parentValue === 'object' && parentValue?.value 
        ? parentValue.value 
        : parentValue;
      
      if (parentValueKey !== field.showWhen) {
        return null;
      }
    }

    const commonProps = {
      label: field.label,
      value: formData[field.name] || '',
      error: errors[field.name],
      required: field.required,
      icon: field.icon,
      placeholder: field.placeholder,
      disabled: field.disabled,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <Input
            key={field.name}
            {...commonProps}
            onChangeText={(value) => handleFieldChange(field.name, value)}
            keyboardType={
              field.type === 'number' ? 'numeric' :
              field.type === 'tel' ? 'phone-pad' :
              field.type === 'email' ? 'email-address' : 'default'
            }
          />
        );

      case 'textarea':
        return (
          <Input
            key={field.name}
            {...commonProps}
            onChangeText={(value) => handleFieldChange(field.name, value)}
            multiline
            numberOfLines={field.numberOfLines || 6}
          />
        );

      case 'dropdown':
        return (
          <DropdownField
            key={field.name}
            {...commonProps}
            value={formData[field.name]}
            options={field.options || []}
            onSelect={(value) => handleFieldChange(field.name, value)}
            allowAddNew={field.allowAddNew}
            onAddNew={(newValue) => {
              const newOption = { value: newValue.toLowerCase().replace(/\s+/g, '_'), label: newValue };
              field.options.push(newOption);
              handleFieldChange(field.name, newOption);
            }}
          />
        );

      case 'multiselect':
        // Get dynamic options for dependent fields or use static options
        const multiselectOptions = field.dependsOn ? getDynamicOptions(field) : (field.options || []);
        
        // Check if parent field has selections for dependent fields
        const parentHasSelections = field.dependsOn ? 
          (formData[field.dependsOn] && formData[field.dependsOn].length > 0) : true;
        
        // Don't render dependent field if parent has no selections or no options available
        if (field.dependsOn && (!parentHasSelections || multiselectOptions.length === 0)) {
          return null;
        }

        return (
          <MultiSelectField
            key={field.name}
            {...commonProps}
            value={formData[field.name] || []}
            options={multiselectOptions}
            onSelect={(value) => handleFieldChange(field.name, value)}
            maxSelections={field.maxSelections}
            allowAddNew={field.allowAddNew}
            onAddNew={(newValue) => {
              const newOption = { value: newValue.toLowerCase().replace(/\s+/g, '_'), label: newValue };
              field.options.push(newOption);
            }}
          />
        );

      case 'autocomplete':
        return (
          <AutoCompleteField
            key={field.name}
            {...commonProps}
            value={formData[field.name] || ''}
            suggestions={field.suggestions || []}
            onChangeText={(value) => handleFieldChange(field.name, value)}
            onSelect={(value) => handleFieldChange(field.name, value.label)}
            allowAddNew={field.allowAddNew}
            onAddNew={(newValue) => {
              handleFieldChange(field.name, newValue);
            }}
            multiline={field.multiline}
            numberOfLines={field.numberOfLines}
          />
        );

      case 'checkbox':
        return (
          <CheckboxField
            key={field.name}
            label={field.label}
            value={formData[field.name] || false}
            onToggle={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
            description={field.description}
          />
        );

      case 'time':
        return (
          <TimePickerField
            key={field.name}
            {...commonProps}
            value={formData[field.name]}
            onSelect={(value) => handleFieldChange(field.name, value)}
          />
        );

      case 'weekdays':
        return (
          <WeekDaysField
            key={field.name}
            label={field.label}
            value={formData[field.name] || []}
            onSelect={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
            required={field.required}
          />
        );

      case 'questionbuilder':
        return (
          <QuestionBuilderField
            key={field.name}
            label={field.label}
            value={formData[field.name] || []}
            onSelect={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
            required={field.required}
          />
        );

      case 'date':
        return (
          <Input
            key={field.name}
            {...commonProps}
            onChangeText={(value) => handleFieldChange(field.name, value)}
            placeholder="YYYY-MM-DD"
          />
        );

      default:
        return null;
    }
  };

  // Render progress indicator
  const renderProgressIndicator = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentStep + 1) / formSteps.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {formSteps.length}
        </Text>
      </View>
    );
  };

  // Render step navigation dots
  const renderStepNavigation = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.stepNavigationContainer}
        contentContainerStyle={styles.stepNavigationContent}
      >
        {formSteps.map((step, index) => (
          <TouchableOpacity
            key={index}
            style={styles.stepNumberButton}
            onPress={() => jumpToStep(index)}
          >
            <View style={[
              styles.stepNumberCircle,
              index === currentStep && styles.stepNumberCircleActive,
              index < currentStep && styles.stepNumberCircleCompleted,
            ]}>
              <Text style={[
                styles.stepNumberText,
                (index === currentStep || index < currentStep) && styles.stepNumberTextActive
              ]}>{index + 1}</Text>
            </View>
            <Text style={[
              styles.stepNumberLabel,
              index === currentStep && styles.stepNumberLabelActive
            ]} numberOfLines={1}>
              {step.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{currentStepData.title}</Text>
              <Text style={styles.headerSubtitle}>
                Step {currentStep + 1} of {formSteps.length}
              </Text>
            </View>
            {onCancel && (
              <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>

          {renderProgressIndicator()}
          {renderStepNavigation()}

          <View style={styles.formContainer}>
            {currentStepData.fields.map((field) => renderField(field))}
          </View>

          <View style={styles.footer}>
            <View style={styles.buttonRow}>
              {!isFirstStep && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handlePrevious}
                >
                  <Ionicons name="arrow-back" size={20} color="#4f46e5" />
                  <Text style={styles.secondaryButtonText}>Previous</Text>
                </TouchableOpacity>
              )}

              <Button
                title={isLastStep ? 'Submit Job Post' : 'Next'}
                onPress={handleNext}
                loading={isSubmitting}
                style={[styles.primaryButton, isFirstStep && styles.fullWidthButton]}
                icon={isLastStep ? 'checkmark-circle-outline' : 'arrow-forward'}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.xl,
    paddingTop: spacing.xl + 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0,
    ...shadows.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h4,
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    ...typography.caption,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  closeButton: {
    padding: spacing.xs,
  },
  progressContainer: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.caption,
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '600',
  },
  stepNavigationContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...shadows.sm,
  },
  stepNavigationContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  stepNumberButton: {
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    minWidth: 80,
  },
  stepNumberCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 3,
    borderColor: '#cbd5e1',
    ...shadows.sm,
  },
  stepNumberCircleActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
    ...shadows.md,
  },
  stepNumberCircleCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  stepNumberText: {
    ...typography.button,
    color: '#64748b',
    fontSize: 16,
    fontWeight: '700',
  },
  stepNumberTextActive: {
    color: '#ffffff',
  },
  stepNumberLabel: {
    ...typography.caption,
    color: '#64748b',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '500',
  },
  stepNumberLabelActive: {
    color: '#4f46e5',
    fontWeight: '700',
  },
  formContainer: {
    padding: spacing.xl,
    backgroundColor: '#ffffff',
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  footer: {
    padding: spacing.xl,
    backgroundColor: '#ffffff',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    ...shadows.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#4f46e5',
    borderRadius: 12,
    gap: spacing.xs,
    ...shadows.sm,
  },
  secondaryButtonText: {
    ...typography.button,
    color: '#4f46e5',
    fontWeight: '600',
    fontSize: 16,
  },
  primaryButton: {
    flex: 1,
  },
  fullWidthButton: {
    flex: 1,
  },
});

export default MultiStepJobPostForm;
