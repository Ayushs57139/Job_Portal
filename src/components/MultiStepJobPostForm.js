import React, { useState, useRef } from 'react';
import {
  View, ScrollView, Text, StyleSheet, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { formSteps } from '../data/jobPostFormConfig';
import { INDUSTRIES_DATA, getSubIndustries } from '../data/industriesData';
import { DEPARTMENTS_DATA, getSubDepartments } from '../data/departmentsData';
import {
  BASIC_EDUCATION_LEVELS,
  ITI_COURSE_OPTIONS, ITI_SPECIALIZATION_OPTIONS,
  DIPLOMA_COURSE_OPTIONS, DIPLOMA_SPECIALIZATION_OPTIONS,
  GRADUATE_COURSE_OPTIONS, GRADUATE_SPECIALIZATION_OPTIONS,
  POST_GRADUATE_COURSE_OPTIONS, POST_GRADUATE_SPECIALIZATION_OPTIONS,
  DOCTORATE_COURSE_OPTIONS, DOCTORATE_SPECIALIZATION_OPTIONS,
} from '../data/educationData';
import Input from './Input';
import DropdownField from './FormFields/DropdownField';
import MultiSelectField from './FormFields/MultiSelectField';
import AutoCompleteField from './FormFields/AutoCompleteField';
import CheckboxField from './FormFields/CheckboxField';
import TimePickerField from './FormFields/TimePickerField';
import WeekDaysField from './FormFields/WeekDaysField';
import QuestionBuilderField from './FormFields/QuestionBuilderField';

const fieldHasValue = (v) => {
  if (v === null || v === undefined || v === '') return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'boolean') return true;
  return true;
};

const MultiStepJobPostForm = ({
  onSubmit, initialData = {}, onCancel, onChange,
  initialStep = 0, enableAutosave = false, autosaveKey = null,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep || 0);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optionsUpdateKey, setOptionsUpdateKey] = useState(0);
  const scrollViewRef = useRef(null);
  const { width: vw } = useWindowDimensions();
  const isMobile = vw < 768;

  const currentStepData = formSteps[currentStep];
  const isLastStep = currentStep === formSteps.length - 1;
  const isFirstStep = currentStep === 0;

  // Progressive reveal
  const getVisibleFields = (fields, data) => {
    const visible = [];
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      if (f.dependsOn && !data[f.dependsOn]) continue;
      if (f.dependsOn && f.showWhen) {
        const pv = data[f.dependsOn];
        const pvk = typeof pv === 'object' && pv?.value ? pv.value : pv;
        if (pvk !== f.showWhen) continue;
      }
      if (visible.length === 0) { visible.push(f); continue; }
      const prevReqFilled = visible.filter(x => x.required).every(x => fieldHasValue(data[x.name]));
      if (!prevReqFilled) break;
      const prev = visible[visible.length - 1];
      if (f.required) {
        visible.push(f);
      } else {
        if (fieldHasValue(data[prev.name]) || !prev.required) visible.push(f);
        else break;
      }
    }
    return visible;
  };

  const notifyChange = async (nextData, nextStep = currentStep) => {
    if (onChange) { try { onChange(nextData, nextStep); } catch (_) {} }
    if (enableAutosave && autosaveKey) {
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        await AsyncStorage.setItem(autosaveKey, JSON.stringify({ formData: nextData, currentStep: nextStep, updatedAt: Date.now() }));
      } catch (_) {}
    }
  };

  const handleFieldChange = (name, value) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      notifyChange(next);
      return next;
    });
    if (errors[name]) setErrors(p => { const e = { ...p }; delete e[name]; return e; });
    if (name === 'industries') setFormData(p => ({ ...p, subIndustries: [] }));
    if (name === 'departments') setFormData(p => ({ ...p, subDepartments: [] }));
    if (name === 'educationLevel') setFormData(p => ({ ...p, course: [], specialization: [] }));
    if (name === 'course') setFormData(p => ({ ...p, specialization: [] }));
    if (name === 'disabilityStatus') setFormData(p => ({ ...p, disabilityTypes: [] }));
  };

  const norm = (s) => s ? s.toLowerCase().trim().replace(/\s+/g, '_').replace(/\//g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') : '';

  const getDynamicOptions = (field) => {
    if (field.name === 'subIndustries') {
      const sel = formData.industries || [];
      if (!sel.length) return [];
      const labels = sel.map(item => {
        const ind = INDUSTRIES_DATA.find(i => norm(i.industry) === (typeof item === 'string' ? item : item.value));
        return ind ? ind.industry : null;
      }).filter(Boolean);
      return getSubIndustries(labels).map(s => ({ value: norm(s), label: s }));
    }
    if (field.name === 'subDepartments') {
      const sel = formData.departments || [];
      if (!sel.length) return [];
      const labels = sel.map(item => {
        const d = DEPARTMENTS_DATA.find(x => norm(x.department) === (typeof item === 'string' ? item : item.value));
        return d ? d.department : null;
      }).filter(Boolean);
      return getSubDepartments(labels).map(s => ({ value: norm(s), label: s }));
    }
    if (field.name === 'course') {
      const sel = formData.educationLevel || [];
      if (!sel.length) return [];
      const lvls = sel.map(item => {
        const v = typeof item === 'string' ? item : item.value;
        return v.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      });
      if (lvls.every(l => BASIC_EDUCATION_LEVELS.includes(l))) return [];
      let opts = [];
      lvls.forEach(l => {
        if (l === 'ITI') opts = [...opts, ...ITI_COURSE_OPTIONS];
        else if (l === 'Diploma') opts = [...opts, ...DIPLOMA_COURSE_OPTIONS];
        else if (l === 'Graduate') opts = [...opts, ...GRADUATE_COURSE_OPTIONS];
        else if (l === 'Post Graduate') opts = [...opts, ...POST_GRADUATE_COURSE_OPTIONS];
        else if (l === 'Doctorate') opts = [...opts, ...DOCTORATE_COURSE_OPTIONS];
      });
      return [...new Set(opts)].map(c => ({ value: c.toLowerCase().replace(/[\s/.()\[\]]/g, '_').replace(/_+/g, '_'), label: c }));
    }
    if (field.name === 'specialization') {
      const sel = formData.course || [];
      if (!sel.length) return [];
      const cls = sel.map(item => {
        const v = typeof item === 'string' ? item : item.value;
        return v.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      });
      let opts = [];
      cls.forEach(c => {
        if (ITI_COURSE_OPTIONS.includes(c)) opts = [...opts, ...ITI_SPECIALIZATION_OPTIONS];
        else if (DIPLOMA_COURSE_OPTIONS.includes(c)) opts = [...opts, ...DIPLOMA_SPECIALIZATION_OPTIONS];
        else if (GRADUATE_COURSE_OPTIONS.includes(c)) opts = [...opts, ...GRADUATE_SPECIALIZATION_OPTIONS];
        else if (POST_GRADUATE_COURSE_OPTIONS.includes(c)) opts = [...opts, ...POST_GRADUATE_SPECIALIZATION_OPTIONS];
        else if (DOCTORATE_COURSE_OPTIONS.includes(c)) opts = [...opts, ...DOCTORATE_SPECIALIZATION_OPTIONS];
      });
      return [...new Set(opts)].map(s => ({ value: s.toLowerCase().replace(/[\s/.()\[\]&']/g, '_').replace(/_+/g, '_'), label: s }));
    }
    return field.options || [];
  };

  const validateCurrentStep = () => {
    const errs = {};
    currentStepData.fields.forEach(f => {
      if (f.dependsOn && !formData[f.dependsOn]) return;
      if (f.dependsOn && f.showWhen) {
        const pv = formData[f.dependsOn];
        const pvk = typeof pv === 'object' && pv?.value ? pv.value : pv;
        if (pvk !== f.showWhen) return;
      }
      if (f.required) {
        const v = formData[f.name];
        if (!v || (Array.isArray(v) && !v.length) || v === '') errs[f.name] = `${f.label} is required`;
      }
      if (f.type === 'email' && formData[f.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[f.name]))
        errs[f.name] = 'Please enter a valid email address';
      if (f.type === 'tel' && formData[f.name] && !/^[0-9]{10}$/.test(formData[f.name].replace(/[^0-9]/g, '')))
        errs[f.name] = 'Please enter a valid phone number';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (isLastStep) handleSubmit();
      else {
        setCurrentStep(p => p + 1);
        notifyChange(formData, currentStep + 1);
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }
    } else {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(p => { const n = p - 1; notifyChange(formData, n); return n; });
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const jumpToStep = (idx) => {
    setCurrentStep(idx);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) { Alert.alert('Validation Error', 'Please fill in all required fields correctly.'); return; }
    setIsSubmitting(true);
    try { await onSubmit(formData); }
    catch (e) { Alert.alert('Error', e.message || 'Failed to submit. Please try again.'); }
    finally { setIsSubmitting(false); }
  };

  const renderField = (field) => {
    if (field.dependsOn && !formData[field.dependsOn]) return null;
    if (field.dependsOn && field.showWhen) {
      const pv = formData[field.dependsOn];
      const pvk = typeof pv === 'object' && pv?.value ? pv.value : pv;
      if (pvk !== field.showWhen) return null;
    }
    const cp = {
      label: field.label, value: formData[field.name] || '',
      error: errors[field.name], required: field.required,
      placeholder: field.placeholder, disabled: field.disabled,
    };
    switch (field.type) {
      case 'text': case 'email': case 'tel': case 'number':
        return <Input key={field.name} {...cp} onChangeText={v => handleFieldChange(field.name, v)}
          keyboardType={field.type === 'number' ? 'numeric' : field.type === 'tel' ? 'phone-pad' : field.type === 'email' ? 'email-address' : 'default'} />;
      case 'textarea':
        return <Input key={field.name} {...cp} onChangeText={v => handleFieldChange(field.name, v)} multiline numberOfLines={field.numberOfLines || 6} />;
      case 'dropdown':
        return <DropdownField key={field.name} {...cp} value={formData[field.name]} options={field.options || []}
          onSelect={v => handleFieldChange(field.name, v)} allowAddNew={field.allowAddNew}
          onAddNew={nv => { const o = { value: nv.toLowerCase().replace(/\s+/g, '_'), label: nv }; field.options?.push(o); handleFieldChange(field.name, o); }} />;
      case 'multiselect': {
        const opts = [...(field.dependsOn ? getDynamicOptions(field) : (field.options || []))];
        const parentOk = field.dependsOn ? (formData[field.dependsOn] && formData[field.dependsOn].length > 0) : true;
        if (field.dependsOn && (!parentOk || !opts.length)) return null;
        return (
          <MultiSelectField key={field.name} {...cp} value={formData[field.name] || []} options={opts}
            onSelect={v => handleFieldChange(field.name, v)} maxSelections={field.maxSelections} allowAddNew={field.allowAddNew}
            onAddNew={async nv => {
              try {
                let o = null;
                if (field.name === 'keySkills') {
                  const r = await api.addKeySkill(nv);
                  if (r.success || r.keySkill) {
                    o = { value: nv.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_').replace(/[()]/g, ''), label: nv };
                    field.options?.push(o); setOptionsUpdateKey(p => p + 1);
                    const cur = formData[field.name] || [];
                    if (!cur.some(x => x.value === o.value)) { handleFieldChange(field.name, [...cur, o]); setTimeout(() => Alert.alert('Success', 'Key skill added'), 100); }
                  }
                } else if (field.name === 'jobRoles') {
                  const r = await api.addJobRole(nv);
                  if (r.success || r.jobRole) {
                    o = { value: nv.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_').replace(/[()]/g, '').replace(/-/g, '_'), label: nv };
                    field.options?.push(o); setOptionsUpdateKey(p => p + 1);
                    const cur = formData[field.name] || [];
                    if (!cur.some(x => x.value === o.value)) { handleFieldChange(field.name, [...cur, o]); setTimeout(() => Alert.alert('Success', 'Job role added'), 100); }
                  }
                } else {
                  o = { value: nv.toLowerCase().replace(/\s+/g, '_'), label: nv };
                  field.options?.push(o); setOptionsUpdateKey(p => p + 1);
                  const cur = formData[field.name] || [];
                  if (!cur.some(x => x.value === o.value)) handleFieldChange(field.name, [...cur, o]);
                }
              } catch (e) { Alert.alert('Error', e.message || 'Failed to add item.'); }
            }} />
        );
      }
      case 'autocomplete':
        return <AutoCompleteField key={field.name} {...cp} value={formData[field.name] || ''} suggestions={field.suggestions || []}
          onChangeText={v => handleFieldChange(field.name, v)} onSelect={v => handleFieldChange(field.name, v.label)}
          allowAddNew={field.allowAddNew} onAddNew={async nv => {
            handleFieldChange(field.name, nv);
            try {
              if (field.name === 'companyName') await api.addCompany(nv);
              else if (field.name === 'jobTitle') await api.addJobTitle(nv);
            } catch (_) {}
          }} multiline={field.multiline} numberOfLines={field.numberOfLines} />;
      case 'checkbox':
        return <CheckboxField key={field.name} label={field.label} value={formData[field.name] || false}
          onToggle={v => handleFieldChange(field.name, v)} error={errors[field.name]} description={field.description} />;
      case 'time':
        return <TimePickerField key={field.name} {...cp} value={formData[field.name]} onSelect={v => handleFieldChange(field.name, v)} />;
      case 'weekdays':
        return <WeekDaysField key={field.name} label={field.label} value={formData[field.name] || []}
          onSelect={v => handleFieldChange(field.name, v)} error={errors[field.name]} required={field.required} />;
      case 'questionbuilder':
        return <QuestionBuilderField key={field.name} label={field.label} value={formData[field.name] || []}
          onSelect={v => handleFieldChange(field.name, v)} error={errors[field.name]} required={field.required} />;
      case 'date':
        return <Input key={field.name} {...cp} onChangeText={v => handleFieldChange(field.name, v)} placeholder="YYYY-MM-DD" />;
      default: return null;
    }
  };

  // ── Sidebar ──────────────────────────────────────────────
  const renderSidebar = () => {
    if (isMobile) {
      return (
        <View style={S.mobileSidebar}>
          <Text style={S.mobileTitle}>Post a Job</Text>
          <View style={S.mobileDots}>
            {formSteps.map((_, idx) => (
              <View key={idx} style={[S.mobileDot, idx === currentStep && S.mobileDotActive, idx < currentStep && S.mobileDotDone]} />
            ))}
          </View>
          <Text style={S.mobileStepLabel}>Step {currentStep + 1}/{formSteps.length} — {currentStepData.title}</Text>
        </View>
      );
    }
    return (
      <View style={S.sidebar}>
        <View style={S.sidebarTop}>
          <Text style={S.sidebarTitle}>Post a Job</Text>
          <Text style={S.sidebarMeta}>{currentStep + 1} of {formSteps.length} steps</Text>
        </View>
        <View style={S.stepList}>
          {formSteps.map((step, idx) => {
            const active = idx === currentStep;
            const done = idx < currentStep;
            return (
              <TouchableOpacity key={idx} style={S.stepRow} onPress={() => jumpToStep(idx)} activeOpacity={0.7}>
                <View style={S.stepLeft}>
                  {idx > 0 && <View style={[S.lineTop, done && S.lineDone, active && S.lineActive]} />}
                  <View style={[S.dot, active && S.dotActive, done && S.dotDone]}>
                    {done
                      ? <Ionicons name="checkmark" size={9} color="#fff" />
                      : <View style={[S.dotCore, active && S.dotCoreActive]} />
                    }
                  </View>
                  {idx < formSteps.length - 1 && <View style={[S.lineBottom, done && S.lineDone]} />}
                </View>
                <View style={S.stepText}>
                  <Text style={[S.stepName, active && S.stepNameActive, done && S.stepNameDone]}>{step.title}</Text>
                  {active && <Text style={S.stepStatus}>In progress</Text>}
                  {done && <Text style={S.stepStatusDone}>Completed</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // ── Compute visible fields ────────────────────────────────
  const visibleFields = getVisibleFields(currentStepData.fields, formData);
  const totalEligible = currentStepData.fields.filter(f => {
    if (f.dependsOn && !formData[f.dependsOn]) return false;
    if (f.dependsOn && f.showWhen) {
      const pv = formData[f.dependsOn];
      const pvk = typeof pv === 'object' && pv?.value ? pv.value : pv;
      if (pvk !== f.showWhen) return false;
    }
    return true;
  }).length;
  const filledCount = visibleFields.filter(f => fieldHasValue(formData[f.name])).length;
  const hasMore = visibleFields.length < totalEligible;

  return (
    <View style={S.root}>
      <KeyboardAvoidingView style={S.kav} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <View style={[S.layout, isMobile && S.layoutMobile]}>
          {renderSidebar()}

          <View style={S.main}>
            <ScrollView ref={scrollViewRef} style={S.scroll} contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>

              {/* Step header */}
              <View style={S.stepHeader}>
                <View style={S.stepHeaderLeft}>
                  <Text style={S.stepBadge}>Step {currentStep + 1}</Text>
                  <Text style={S.stepTitle}>{currentStepData.title}</Text>
                  {currentStepData.description && <Text style={S.stepDesc}>{currentStepData.description}</Text>}
                </View>
                {onCancel && (
                  <TouchableOpacity onPress={onCancel} style={S.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Form card */}
              <View style={S.formCard}>
                {/* Progress */}
                <View style={S.progressRow}>
                  <Text style={S.progressText}>{filledCount} of {totalEligible} fields filled</Text>
                  <View style={S.progressTrack}>
                    <View style={[S.progressFill, { width: `${totalEligible > 0 ? (filledCount / totalEligible) * 100 : 0}%` }]} />
                  </View>
                </View>

                {visibleFields.map(f => renderField(f))}

                {hasMore && (
                  <View style={S.revealHint}>
                    <Ionicons name="chevron-down" size={13} color="#9CA3AF" />
                    <Text style={S.revealHintText}>Fill the fields above to reveal more</Text>
                  </View>
                )}
              </View>

              {/* Navigation */}
              <View style={S.navRow}>
                {!isFirstStep
                  ? <TouchableOpacity style={S.backBtn} onPress={handlePrevious}>
                      <Ionicons name="arrow-back" size={15} color="#4F46E5" />
                      <Text style={S.backText}>Back</Text>
                    </TouchableOpacity>
                  : <View />
                }
                <TouchableOpacity style={[S.nextBtn, isSubmitting && S.nextBtnDisabled]} onPress={handleNext} disabled={isSubmitting}>
                  <Text style={S.nextText}>{isLastStep ? 'Submit' : 'Next'}</Text>
                  <Ionicons name={isLastStep ? 'checkmark' : 'arrow-forward'} size={15} color="#fff" />
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  kav: { flex: 1 },
  layout: { flex: 1, flexDirection: 'row' },
  layoutMobile: { flexDirection: 'column' },

  // ── Sidebar ──────────────────────────────────────────────
  sidebar: {
    width: 220,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
    paddingTop: 32,
  },
  sidebarTop: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sidebarMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  stepList: {
    paddingHorizontal: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 52,
  },
  stepLeft: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  lineTop: {
    position: 'absolute',
    top: -26,
    width: 2,
    height: 26,
    backgroundColor: '#E5E7EB',
  },
  lineBottom: {
    position: 'absolute',
    top: 22,
    width: 2,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  lineDone: { backgroundColor: '#4F46E5' },
  lineActive: { backgroundColor: '#4F46E5' },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    marginTop: 2,
  },
  dotActive: { borderColor: '#4F46E5', backgroundColor: '#4F46E5' },
  dotDone: { borderColor: '#4F46E5', backgroundColor: '#4F46E5' },
  dotCore: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB' },
  dotCoreActive: { backgroundColor: '#fff' },
  stepText: { flex: 1, paddingTop: 2, paddingBottom: 16 },
  stepName: { fontSize: 13, color: '#6B7280', fontWeight: '500', lineHeight: 18 },
  stepNameActive: { color: '#111827', fontWeight: '700' },
  stepNameDone: { color: '#4F46E5', fontWeight: '600' },
  stepStatus: { fontSize: 11, color: '#4F46E5', marginTop: 2 },
  stepStatusDone: { fontSize: 11, color: '#10B981', marginTop: 2 },

  // ── Mobile sidebar ────────────────────────────────────────
  mobileSidebar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  mobileTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 8 },
  mobileDots: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  mobileDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E7EB' },
  mobileDotActive: { backgroundColor: '#4F46E5', width: 20 },
  mobileDotDone: { backgroundColor: '#10B981' },
  mobileStepLabel: { fontSize: 12, color: '#6B7280' },

  // ── Main content ──────────────────────────────────────────
  main: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // ── Step header ───────────────────────────────────────────
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stepHeaderLeft: { flex: 1 },
  stepBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  stepDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
    marginLeft: 12,
  },

  // ── Form card ─────────────────────────────────────────────
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  // ── Progress ──────────────────────────────────────────────
  progressRow: { marginBottom: 24, gap: 6 },
  progressText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  progressTrack: { height: 2, backgroundColor: '#F3F4F6', borderRadius: 1, overflow: 'hidden' },
  progressFill: { height: 2, backgroundColor: '#4F46E5', borderRadius: 1 },

  // ── Reveal hint ───────────────────────────────────────────
  revealHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  revealHintText: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' },

  // ── Navigation ────────────────────────────────────────────
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  backText: { fontSize: 14, color: '#4F46E5', fontWeight: '600' },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
  },
  nextBtnDisabled: { opacity: 0.6 },
  nextText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  navSpacer: { flex: 1 },
});

export default MultiStepJobPostForm;
