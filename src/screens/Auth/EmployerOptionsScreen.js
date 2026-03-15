import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, Dimensions, Animated, Platform, Modal, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api, { API_URL } from '../../config/api';
import Header from '../../components/Header';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isWide = width > 900;

const REFERRAL_SOURCES = [
  'Freejobwala YouTube Channel', 'Other YouTube Channel', 'YouTube Ads', 'YouTube',
  'TV Ads', 'Arattai Messenger', 'WhatsApp', 'Telegram', 'LinkedIn', 'Facebook',
  'Instagram', 'Grokipedia', 'Wikipedia', 'X / Twitter', 'Google Search',
  'Google Play Store', 'Internet Searches', 'Refer By Friend', 'Refer By Recruiter',
  'Post Shared By Friend', 'Refer By Job Consultancy', 'Refer By Another Company',
  'Other Social Media Platform',
];

// ─── Static data ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    id: 'talent',
    icon: 'people-outline',
    title: 'Talent Sourcing',
    desc: 'Access India\'s largest talent pool with AI-powered search and matching.',
    color: '#6366f1',
  },
  {
    id: 'screen',
    icon: 'filter-outline',
    title: 'Screening & Evaluation',
    desc: 'Automated screening tools to shortlist the best candidates faster.',
    color: '#0ea5e9',
  },
  {
    id: 'brand',
    icon: 'star-outline',
    title: 'Employer Branding',
    desc: 'Showcase your brand story to millions of relevant job seekers.',
    color: '#f59e0b',
  },
  {
    id: 'auto',
    icon: 'flash-outline',
    title: 'Hiring Automation',
    desc: 'Streamline your hiring pipeline with smart automation workflows.',
    color: '#10b981',
  },
];

const TESTIMONIALS = [
  {
    id: '1',
    text: 'Freejobwala has been one of our most reliable sources for recruitment with a very efficient team who go out of their way to make sure requests are taken care of immediately.',
    name: 'Naveen Malhotra',
    role: 'Senior Manager Talent Acquisition',
    company: 'Group IRIS',
  },
  {
    id: '2',
    text: 'As a Core Engineering Employer, I feel confident of having relevant, available and genuine Resumes. Its Search Engine Capabilities and keyword matching are excellent.',
    name: 'Kreeti Mathur',
    role: 'Human Resources Development Manager',
    company: 'ISGEC',
  },
  {
    id: '3',
    text: 'Freejobwala has a strong database of profiles. It has given vast accessibility to most of the job seekers in India and the relevancy of the profiles are undoubtedly good.',
    name: 'Padma Thyagarajan',
    role: 'Head - HR',
    company: 'Niteo Technologies',
  },
];

const FAQS = [
  {
    q: 'How can a recruiter sign up for a Freejobwala account?',
    a: 'Click "Register/Log in" tab above, choose your account type (Company or Consultancy), fill in your details and complete KYC verification to get started.',
  },
  {
    q: 'How does pricing work for recruiter plans and job postings?',
    a: 'We offer flexible plans starting from free job postings. Premium plans unlock advanced features like resume search, candidate tracking, and priority listing.',
  },
  {
    q: 'What support, insight, and team collaboration features are available?',
    a: 'Our platform includes team management, role-based access, analytics dashboard, email notifications, and dedicated support for all registered employers.',
  },
  {
    q: 'How secure is my recruiter account?',
    a: 'We use industry-standard encryption, JWT-based authentication, and regular security audits to keep your account and data safe.',
  },
  {
    q: 'How can I find the right candidates using Freejobwala?',
    a: 'Use our AI-powered candidate search, set job alerts, and leverage our resume database to find candidates matching your exact requirements.',
  },
];

// ─── FAQ Item ────────────────────────────────────────────────────────────────

const FAQItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setOpen(!open)}
      activeOpacity={0.8}
    >
      <View style={styles.faqRow}>
        <Text style={styles.faqQ}>{item.question || item.q}</Text>
        <Ionicons name={open ? 'remove' : 'add'} size={22} color="#1e293b" />
      </View>
      {open && <Text style={styles.faqA}>{item.answer || item.a}</Text>}
    </TouchableOpacity>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

const EmployerOptionsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('sales');
  const [hiringFor, setHiringFor] = useState('company');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Dynamic FAQs
  const [dynamicFaqs, setDynamicFaqs] = useState(FAQS);
  useEffect(() => {
    fetch(`${API_URL}/faqs?category=Employers`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data.length > 0) setDynamicFaqs(d.data); })
      .catch(() => {}); // silently fall back to static FAQs
  }, []);

  // Login state
  const [employerType, setEmployerType] = useState('company');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Card mode: 'login' or 'register'
  const [cardMode, setCardMode] = useState('login');

  // Registration state
  const [regEmployerType, setRegEmployerType] = useState('company');
  const [regForm, setRegForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    whatsappAvailable: false, password: '', companyName: '',
    consultancyName: '', designation: '', heardAboutUs: '',
    agreeToTerms: false, receiveUpdates: false,
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regErrors, setRegErrors] = useState({});
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const updateRegField = (field, value) => {
    setRegForm(prev => ({ ...prev, [field]: value }));
    setRegErrors(prev => ({ ...prev, [field]: null }));
  };

  const validateRegForm = () => {
    const e = {};
    if (!regForm.firstName.trim()) e.firstName = 'First name is required';
    if (!regForm.lastName.trim()) e.lastName = 'Last name is required';
    if (!regForm.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email)) e.email = 'Please enter a valid email';
    if (!regForm.phone.trim()) e.phone = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(regForm.phone)) e.phone = 'Please enter a valid 10-digit mobile number';
    if (!regForm.password) e.password = 'Password is required';
    else if (regForm.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (regEmployerType === 'company') {
      if (!regForm.companyName.trim()) e.companyName = 'Company name is required';
    } else {
      if (!regForm.consultancyName.trim()) e.consultancyName = 'Consultancy name is required';
    }
    if (!regForm.designation.trim()) e.designation = 'Designation is required';
    if (!regForm.heardAboutUs) e.heardAboutUs = 'Please select an option';
    if (!regForm.agreeToTerms) e.agreeToTerms = 'You must agree to the terms and conditions';
    setRegErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validateRegForm()) return;
    setRegLoading(true);
    try {
      const data = {
        firstName: regForm.firstName, lastName: regForm.lastName,
        email: regForm.email, phone: regForm.phone, password: regForm.password,
      };
      if (regEmployerType === 'company') {
        data.company = { name: regForm.companyName, designation: regForm.designation, heardAboutUs: regForm.heardAboutUs };
        const res = await api.companyRegister(data);
        if (res && res.token) {
          Alert.alert('Success', 'Registration successful! Redirecting to KYC verification...', [
            { text: 'OK', onPress: () => navigation.navigate('KYCForm', { userType: 'company' }) },
          ]);
          setTimeout(() => navigation.navigate('KYCForm', { userType: 'company' }), 500);
        } else {
          Alert.alert('Registration Failed', 'Registration was not successful. Please try again.');
        }
      } else {
        data.consultancy = { name: regForm.consultancyName, designation: regForm.designation, heardAboutUs: regForm.heardAboutUs };
        const res = await api.consultancyRegister(data);
        if (res && res.token) {
          Alert.alert('Success', 'Registration successful! Redirecting to KYC verification...', [
            { text: 'OK', onPress: () => navigation.navigate('KYCForm', { userType: 'consultancy' }) },
          ]);
          setTimeout(() => navigation.navigate('KYCForm', { userType: 'consultancy' }), 500);
        } else {
          Alert.alert('Registration Failed', 'Registration was not successful. Please try again.');
        }
      }
    } catch (error) {
      Alert.alert('Registration Failed', error.message || 'Please check your details and try again');
    } finally {
      setRegLoading(false);
    }
  };

  const handleSalesEnquiry = async () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Please enter your full name';
    if (!mobileNumber.trim()) newErrors.mobileNumber = 'Please enter your mobile number';
    if (!workEmail.trim()) newErrors.workEmail = 'Please enter your work email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail)) newErrors.workEmail = 'Please enter a valid email';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setSubmitting(true);
    setErrors({});
    try {
      const response = await api.request('/sales-enquiry/simple', {
        method: 'POST',
        body: JSON.stringify({ fullName: fullName.trim(), phone: mobileNumber.trim(), email: workEmail.trim(), hiringFor }),
      });
      if (response.success) {
        Alert.alert('Success', 'Your enquiry has been submitted! We will contact you soon.');
        setFullName(''); setMobileNumber(''); setWorkEmail(''); setHiringFor('company');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Please enter your email';
    if (!password) newErrors.password = 'Please enter your password';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    setErrors({});
    try {
      let response;
      if (employerType === 'company') {
        response = await api.companyLogin({ email: email.trim(), password });
        if (response.token) {
          if (response.user?.userType === 'company') {
            navigation.reset({ index: 0, routes: [{ name: 'CompanyDashboard' }] });
          } else {
            await api.logout();
            Alert.alert('Access Denied', 'This account is not authorized for company login.');
          }
        }
      } else {
        response = await api.consultancyLogin({ email: email.trim(), password });
        if (response.token) {
          if (response.user?.userType === 'consultancy') {
            navigation.reset({ index: 0, routes: [{ name: 'ConsultancyDashboard' }] });
          } else {
            await api.logout();
            Alert.alert('Access Denied', 'This account is not authorized for consultancy login.');
          }
        }
      }
    } catch (error) {
      const msg = error.message || 'Please check your credentials and try again';
      setErrors({ general: msg });
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
      {/* ── HEADER ── */}
      <Header />

      {/* ── HERO SECTION ── */}
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#0f172a']} style={styles.hero}>
        <View style={[styles.heroInner, isWide && styles.heroInnerWide]}>
          {/* Left copy */}
          <View style={[styles.heroCopy, isWide && styles.heroCopyWide]}>
            <Text style={styles.heroEyebrow}>TALENT DECODED</Text>
            <Text style={styles.heroHeadline}>
              Decode India's largest talent pool with the power of{' '}
              <Text style={styles.heroAI}>✦ AI</Text>
            </Text>
            <View style={styles.heroBullets}>
              <View style={styles.heroBullet}>
                <Ionicons name="people-circle-outline" size={20} color="#a5b4fc" />
                <Text style={styles.heroBulletText}>
                  <Text style={styles.heroBulletBold}>10 lakh+ registered</Text> jobseekers for all your talent needs
                </Text>
              </View>
              <View style={styles.heroBullet}>
                <Ionicons name="flash-outline" size={20} color="#a5b4fc" />
                <Text style={styles.heroBulletText}>Most advanced recruitment AI</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => navigation.navigate('Packages')}
              activeOpacity={0.85}
            >
              <Text style={styles.exploreBtnText}>Explore our products</Text>
            </TouchableOpacity>
          </View>

          {/* Right card */}
          <View style={[styles.heroCard, isWide && styles.heroCardWide]}>
            {/* Tab toggle */}
            <View style={styles.cardTabs}>
              <TouchableOpacity
                style={[styles.cardTab, activeTab === 'sales' && styles.cardTabActive]}
                onPress={() => setActiveTab('sales')}
                activeOpacity={0.8}
              >
                <Text style={[styles.cardTabText, activeTab === 'sales' && styles.cardTabTextActive]}>
                  Sales enquiry
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cardTab, activeTab === 'login' && styles.cardTabActive]}
                onPress={() => setActiveTab('login')}
                activeOpacity={0.8}
              >
                <Text style={[styles.cardTabText, activeTab === 'login' && styles.cardTabTextActive]}>
                  Register/Log in
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'sales' ? (
              /* ── SALES ENQUIRY FORM ── */
              <View>
                <TextInput
                  style={[styles.cardInput, errors.fullName && styles.cardInputError]}
                  placeholder="Full name"
                  placeholderTextColor="#94a3b8"
                  value={fullName}
                  onChangeText={t => { setFullName(t); setErrors({ ...errors, fullName: null }); }}
                />
                {errors.fullName && <Text style={styles.errTxt}>{errors.fullName}</Text>}

                <TextInput
                  style={[styles.cardInput, errors.mobileNumber && styles.cardInputError]}
                  placeholder="Mobile number"
                  placeholderTextColor="#94a3b8"
                  value={mobileNumber}
                  onChangeText={t => { setMobileNumber(t); setErrors({ ...errors, mobileNumber: null }); }}
                  keyboardType="phone-pad"
                />
                {errors.mobileNumber && <Text style={styles.errTxt}>{errors.mobileNumber}</Text>}

                <TextInput
                  style={[styles.cardInput, errors.workEmail && styles.cardInputError]}
                  placeholder="Work email"
                  placeholderTextColor="#94a3b8"
                  value={workEmail}
                  onChangeText={t => { setWorkEmail(t); setErrors({ ...errors, workEmail: null }); }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {errors.workEmail && <Text style={styles.errTxt}>{errors.workEmail}</Text>}

                <Text style={styles.hiringLabel}>HIRING FOR</Text>
                <View style={styles.hiringRow}>
                  {['company', 'consultancy'].map(opt => (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.hiringOpt, hiringFor === opt && styles.hiringOptActive]}
                      onPress={() => setHiringFor(opt)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.hiringOptTxt, hiringFor === opt && styles.hiringOptTxtActive]}>
                        {opt === 'company' ? 'Your company' : 'Your consultancy'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.callbackBtn, submitting && styles.callbackBtnDisabled]}
                  onPress={handleSalesEnquiry}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  <Text style={styles.callbackBtnTxt}>
                    {submitting ? 'Submitting...' : 'Request callback'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* ── LOGIN / REGISTER FORM ── */
              <View>
                {cardMode === 'login' ? (
                  <View>
                    {/* Employer type toggle */}
                    <View style={styles.typeRow}>
                      {['company', 'consultancy'].map(t => (
                        <TouchableOpacity
                          key={t}
                          style={[styles.typeOpt, employerType === t && styles.typeOptActive]}
                          onPress={() => setEmployerType(t)}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name={t === 'company' ? 'business-outline' : 'people-outline'}
                            size={16}
                            color={employerType === t ? '#6366f1' : '#64748b'}
                          />
                          <Text style={[styles.typeOptTxt, employerType === t && styles.typeOptTxtActive]}>
                            {t === 'company' ? 'Company' : 'Consultancy'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TextInput
                      style={[styles.cardInput, errors.email && styles.cardInputError]}
                      placeholder="Email address"
                      placeholderTextColor="#94a3b8"
                      value={email}
                      onChangeText={t => { setEmail(t); setErrors({ ...errors, email: null }); }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    {errors.email && <Text style={styles.errTxt}>{errors.email}</Text>}

                    <View style={styles.pwdWrapper}>
                      <TextInput
                        style={[styles.cardInputPwd, errors.password && styles.cardInputError]}
                        placeholder="Password"
                        placeholderTextColor="#94a3b8"
                        value={password}
                        onChangeText={t => { setPassword(t); setErrors({ ...errors, password: null }); }}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#64748b" />
                      </TouchableOpacity>
                    </View>
                    {errors.password && <Text style={styles.errTxt}>{errors.password}</Text>}
                    {errors.general && <Text style={styles.errTxt}>{errors.general}</Text>}

                    <TouchableOpacity
                      style={[styles.callbackBtn, loading && styles.callbackBtnDisabled]}
                      onPress={handleLogin}
                      disabled={loading}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.callbackBtnTxt}>{loading ? 'Signing in...' : 'Sign In'}</Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                      <View style={styles.divLine} />
                      <Text style={styles.divTxt}>or</Text>
                      <View style={styles.divLine} />
                    </View>

                    <TouchableOpacity
                      style={styles.registerLink}
                      onPress={() => setCardMode('register')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.registerLinkTxt}>
                        Don't have an account? <Text style={styles.registerLinkBold}>Register here</Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* ── INLINE REGISTER FORM ── */
                  <View>
                    {/* Back to login */}
                    <TouchableOpacity
                      style={styles.backRow}
                      onPress={() => setCardMode('login')}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="arrow-back" size={16} color="#6366f1" />
                      <Text style={styles.backTxt}>Back to login</Text>
                    </TouchableOpacity>

                    {/* Employer type toggle */}
                    <View style={styles.typeRow}>
                      {['company', 'consultancy'].map(t => (
                        <TouchableOpacity
                          key={t}
                          style={[styles.typeOpt, regEmployerType === t && styles.typeOptActive]}
                          onPress={() => setRegEmployerType(t)}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name={t === 'company' ? 'business-outline' : 'people-outline'}
                            size={16}
                            color={regEmployerType === t ? '#6366f1' : '#64748b'}
                          />
                          <Text style={[styles.typeOptTxt, regEmployerType === t && styles.typeOptTxtActive]}>
                            {t === 'company' ? 'Company' : 'Consultancy'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* First + Last name row */}
                    <View style={styles.regRow}>
                      <View style={styles.regHalf}>
                        <TextInput
                          style={[styles.cardInput, { marginBottom: 0 }, regErrors.firstName && styles.cardInputError]}
                          placeholder="First name"
                          placeholderTextColor="#94a3b8"
                          value={regForm.firstName}
                          onChangeText={t => updateRegField('firstName', t)}
                        />
                        {regErrors.firstName && <Text style={styles.errTxt}>{regErrors.firstName}</Text>}
                      </View>
                      <View style={styles.regHalf}>
                        <TextInput
                          style={[styles.cardInput, { marginBottom: 0 }, regErrors.lastName && styles.cardInputError]}
                          placeholder="Last name"
                          placeholderTextColor="#94a3b8"
                          value={regForm.lastName}
                          onChangeText={t => updateRegField('lastName', t)}
                        />
                        {regErrors.lastName && <Text style={styles.errTxt}>{regErrors.lastName}</Text>}
                      </View>
                    </View>

                    <TextInput
                      style={[styles.cardInput, regErrors.email && styles.cardInputError]}
                      placeholder="Email address"
                      placeholderTextColor="#94a3b8"
                      value={regForm.email}
                      onChangeText={t => updateRegField('email', t)}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    {regErrors.email && <Text style={styles.errTxt}>{regErrors.email}</Text>}

                    <TextInput
                      style={[styles.cardInput, regErrors.phone && styles.cardInputError]}
                      placeholder="Mobile number"
                      placeholderTextColor="#94a3b8"
                      value={regForm.phone}
                      onChangeText={t => updateRegField('phone', t)}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                    {regErrors.phone && <Text style={styles.errTxt}>{regErrors.phone}</Text>}
                    <TouchableOpacity
                      style={styles.checkRow}
                      onPress={() => updateRegField('whatsappAvailable', !regForm.whatsappAvailable)}
                    >
                      <Ionicons
                        name={regForm.whatsappAvailable ? 'checkbox' : 'square-outline'}
                        size={16} color={regForm.whatsappAvailable ? '#6366f1' : '#94a3b8'}
                      />
                      <Text style={styles.checkTxt}>Number available on WhatsApp</Text>
                    </TouchableOpacity>

                    <View style={styles.pwdWrapper}>
                      <TextInput
                        style={[styles.cardInputPwd, regErrors.password && styles.cardInputError]}
                        placeholder="Password (min 6 chars)"
                        placeholderTextColor="#94a3b8"
                        value={regForm.password}
                        onChangeText={t => updateRegField('password', t)}
                        secureTextEntry={!showRegPassword}
                      />
                      <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowRegPassword(!showRegPassword)}>
                        <Ionicons name={showRegPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#64748b" />
                      </TouchableOpacity>
                    </View>
                    {regErrors.password && <Text style={styles.errTxt}>{regErrors.password}</Text>}

                    <TextInput
                      style={[styles.cardInput, (regErrors.companyName || regErrors.consultancyName) && styles.cardInputError]}
                      placeholder={regEmployerType === 'company' ? 'Company name' : 'Consultancy name'}
                      placeholderTextColor="#94a3b8"
                      value={regEmployerType === 'company' ? regForm.companyName : regForm.consultancyName}
                      onChangeText={t => updateRegField(regEmployerType === 'company' ? 'companyName' : 'consultancyName', t)}
                    />
                    {regErrors.companyName && <Text style={styles.errTxt}>{regErrors.companyName}</Text>}
                    {regErrors.consultancyName && <Text style={styles.errTxt}>{regErrors.consultancyName}</Text>}

                    <TextInput
                      style={[styles.cardInput, regErrors.designation && styles.cardInputError]}
                      placeholder="Your designation"
                      placeholderTextColor="#94a3b8"
                      value={regForm.designation}
                      onChangeText={t => updateRegField('designation', t)}
                    />
                    {regErrors.designation && <Text style={styles.errTxt}>{regErrors.designation}</Text>}

                    <TouchableOpacity
                      style={[styles.cardInput, styles.pickerBtn, regErrors.heardAboutUs && styles.cardInputError]}
                      onPress={() => setShowSourceModal(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={regForm.heardAboutUs ? styles.pickerTxtSel : styles.pickerTxt}>
                        {regForm.heardAboutUs || 'How did you hear about us?'}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color="#94a3b8" />
                    </TouchableOpacity>
                    {regErrors.heardAboutUs && <Text style={styles.errTxt}>{regErrors.heardAboutUs}</Text>}

                    <TouchableOpacity
                      style={styles.checkRow}
                      onPress={() => updateRegField('agreeToTerms', !regForm.agreeToTerms)}
                    >
                      <Ionicons
                        name={regForm.agreeToTerms ? 'checkbox' : 'square-outline'}
                        size={16} color={regForm.agreeToTerms ? '#6366f1' : '#94a3b8'}
                      />
                      <Text style={styles.checkTxt}>
                        I agree to the <Text style={styles.checkLink}>Terms & Conditions</Text> and <Text style={styles.checkLink}>Privacy Policy</Text>
                      </Text>
                    </TouchableOpacity>
                    {regErrors.agreeToTerms && <Text style={styles.errTxt}>{regErrors.agreeToTerms}</Text>}

                    <TouchableOpacity
                      style={styles.checkRow}
                      onPress={() => updateRegField('receiveUpdates', !regForm.receiveUpdates)}
                    >
                      <Ionicons
                        name={regForm.receiveUpdates ? 'checkbox' : 'square-outline'}
                        size={16} color={regForm.receiveUpdates ? '#6366f1' : '#94a3b8'}
                      />
                      <Text style={styles.checkTxt}>Receive updates and newsletters</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.callbackBtn, regLoading && styles.callbackBtnDisabled]}
                      onPress={handleRegister}
                      disabled={regLoading}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.callbackBtnTxt}>
                        {regLoading ? 'Creating Account...' : `Create ${regEmployerType === 'company' ? 'Company' : 'Consultancy'} Account`}
                      </Text>
                    </TouchableOpacity>

                    {/* Referral Source Modal */}
                    <Modal
                      visible={showSourceModal}
                      transparent
                      animationType="slide"
                      onRequestClose={() => setShowSourceModal(false)}
                    >
                      <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                          <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>How did you hear about us?</Text>
                            <TouchableOpacity onPress={() => setShowSourceModal(false)}>
                              <Ionicons name="close" size={22} color="#1e293b" />
                            </TouchableOpacity>
                          </View>
                          <FlatList
                            data={REFERRAL_SOURCES}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                              <TouchableOpacity
                                style={styles.modalOption}
                                onPress={() => { updateRegField('heardAboutUs', item); setShowSourceModal(false); }}
                              >
                                <Text style={[styles.modalOptionTxt, regForm.heardAboutUs === item && styles.modalOptionTxtSel]}>
                                  {item}
                                </Text>
                                {regForm.heardAboutUs === item && <Ionicons name="checkmark" size={18} color="#6366f1" />}
                              </TouchableOpacity>
                            )}
                          />
                        </View>
                      </View>
                    </Modal>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* ── FEATURES SECTION ── */}
      <View style={styles.section}>
        <Text style={styles.sectionEyebrow}>COMPREHENSIVE SOLUTIONS</Text>
        <Text style={styles.sectionTitle}>Hiring made simple for every business</Text>
        <Text style={styles.sectionSub}>Big or small, we've got you covered every step of the way.</Text>
        <View style={[styles.featuresGrid, isWide && styles.featuresGridWide]}>
          {FEATURES.map(f => (
            <View key={f.id} style={[styles.featureCard, isWide && styles.featureCardWide]}>
              <View style={[styles.featureIcon, { backgroundColor: f.color + '18' }]}>
                <Ionicons name={f.icon} size={28} color={f.color} />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
              <TouchableOpacity
                style={styles.featureLink}
                onPress={() => navigation.navigate('Packages')}
                activeOpacity={0.8}
              >
                <Text style={[styles.featureLinkTxt, { color: f.color }]}>View plans</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* ── NEED HELP BANNER ── */}
      <View style={styles.helpBanner}>
        <View style={styles.helpLeft}>
          <Text style={styles.helpTitle}>Need help?</Text>
          <Text style={styles.helpSub}>Let us help you find the right solution.</Text>
        </View>
        <TouchableOpacity
          style={styles.helpBtn}
          onPress={() => setActiveTab('sales')}
          activeOpacity={0.85}
        >
          <Text style={styles.helpBtnTxt}>Connect with our expert</Text>
        </TouchableOpacity>
      </View>

      {/* ── TESTIMONIALS ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Here's why recruiters trust us</Text>
        <Text style={styles.sectionSub}>Testimonials from valued clients who've elevated their hiring with Freejobwala</Text>
        <View style={[styles.testimonialsRow, isWide && styles.testimonialsRowWide]}>
          {TESTIMONIALS.map((t, i) => (
            <View key={t.id} style={[styles.testimonialCard, isWide && styles.testimonialCardWide]}>
              <Text style={styles.testimonialText}>"{t.text}"</Text>
              <View style={styles.testimonialAuthor}>
                <View style={styles.testimonialAvatar}>
                  <Text style={styles.testimonialAvatarTxt}>{t.name[0]}</Text>
                </View>
                <View>
                  <Text style={styles.testimonialName}>{t.name}</Text>
                  <Text style={styles.testimonialRole}>{t.role}</Text>
                  <Text style={styles.testimonialCompany}>{t.company}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ── FAQ ── */}
      <View style={[styles.section, styles.faqSection]}>
        <Text style={styles.sectionTitle}>Frequently asked questions</Text>
        <View style={styles.faqList}>
          {dynamicFaqs.map((f, i) => <FAQItem key={f._id || i} item={f} />)}
        </View>
      </View>

      {/* ── FOOTER CTA ── */}
      <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.footerCta}>
        <Text style={styles.footerCtaTitle}>Ready to find your next great hire?</Text>
        <Text style={styles.footerCtaSub}>Join thousands of companies already hiring on Freejobwala</Text>
        <TouchableOpacity
          style={styles.footerCtaBtn}
          onPress={() => navigation.navigate('EmployerRegister')}
          activeOpacity={0.85}
        >
          <Text style={styles.footerCtaBtnTxt}>Get started for free</Text>
        </TouchableOpacity>
      </LinearGradient>
    </ScrollView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f8fafc' },

  // Hero
  hero: { paddingTop: 48, paddingBottom: 64, paddingHorizontal: 20 },
  heroInner: { flexDirection: 'column', gap: 32 },
  heroInnerWide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1100, alignSelf: 'center', width: '100%' },
  heroCopy: { flex: 1 },
  heroCopyWide: { maxWidth: 520, paddingRight: 40 },
  heroEyebrow: { fontSize: 12, fontWeight: '700', color: '#a5b4fc', letterSpacing: 2, marginBottom: 12 },
  heroHeadline: { fontSize: isWide ? 44 : 30, fontWeight: '800', color: '#ffffff', lineHeight: isWide ? 54 : 38, marginBottom: 24 },
  heroAI: { color: '#a5b4fc' },
  heroBullets: { gap: 12, marginBottom: 32 },
  heroBullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  heroBulletText: { color: '#cbd5e1', fontSize: 15, flex: 1, lineHeight: 22 },
  heroBulletBold: { color: '#ffffff', fontWeight: '700' },
  exploreBtn: {
    backgroundColor: '#6366f1', paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 8, alignSelf: 'flex-start',
  },
  exploreBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Hero card
  heroCard: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 8,
  },
  heroCardWide: { width: 380, flexShrink: 0 },
  cardTabs: {
    flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 10,
    padding: 4, marginBottom: 20,
  },
  cardTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  cardTabActive: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  cardTabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  cardTabTextActive: { color: '#1e293b', fontWeight: '700' },
  cardInput: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    color: '#1e293b', backgroundColor: '#fff', marginBottom: 10,
  },
  cardInputError: { borderColor: '#ef4444' },
  cardInputPwd: {
    flex: 1, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#1e293b',
  },
  pwdWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderColor: '#e2e8f0', borderRadius: 8, backgroundColor: '#fff', marginBottom: 10,
  },
  eyeBtn: { padding: 12 },
  errTxt: { fontSize: 12, color: '#ef4444', marginBottom: 6, marginTop: -4 },
  hiringLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  hiringRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  hiringOpt: {
    flex: 1, paddingVertical: 10, borderRadius: 20, borderWidth: 1,
    borderColor: '#e2e8f0', alignItems: 'center',
  },
  hiringOptActive: { borderColor: '#6366f1', backgroundColor: '#eef2ff' },
  hiringOptTxt: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  hiringOptTxtActive: { color: '#6366f1', fontWeight: '700' },
  callbackBtn: {
    backgroundColor: '#6366f1', paddingVertical: 14, borderRadius: 8,
    alignItems: 'center', marginTop: 4,
  },
  callbackBtnDisabled: { backgroundColor: '#94a3b8' },
  callbackBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  typeOpt: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0',
  },
  typeOptActive: { borderColor: '#6366f1', backgroundColor: '#eef2ff' },
  typeOptTxt: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  typeOptTxtActive: { color: '#6366f1', fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 14 },
  divLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  divTxt: { fontSize: 13, color: '#94a3b8' },
  registerLink: { alignItems: 'center' },
  registerLinkTxt: { fontSize: 13, color: '#64748b' },
  registerLinkBold: { color: '#6366f1', fontWeight: '700' },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  backTxt: { fontSize: 13, color: '#6366f1', fontWeight: '600' },
  regRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  regHalf: { flex: 1 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  checkTxt: { fontSize: 12, color: '#475569', flex: 1, lineHeight: 18 },
  checkLink: { color: '#6366f1', textDecorationLine: 'underline' },
  pickerBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerTxt: { fontSize: 14, color: '#94a3b8' },
  pickerTxtSel: { fontSize: 14, color: '#1e293b' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 14, width: '100%', maxWidth: 480, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalOptionTxt: { fontSize: 14, color: '#1e293b', flex: 1 },
  modalOptionTxtSel: { fontWeight: '700', color: '#6366f1' },

  // Sections
  section: { paddingHorizontal: 20, paddingVertical: 48, backgroundColor: '#ffffff' },
  sectionEyebrow: { fontSize: 11, fontWeight: '700', color: '#6366f1', letterSpacing: 2, textAlign: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: isWide ? 32 : 24, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: 8 },
  sectionSub: { fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 32, lineHeight: 22 },

  // Features
  featuresGrid: { gap: 16 },
  featuresGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  featureCard: {
    backgroundColor: '#f8fafc', borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  featureCardWide: { flex: 1, minWidth: 200 },
  featureIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  featureTitle: { fontSize: 17, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
  featureDesc: { fontSize: 14, color: '#64748b', lineHeight: 20, marginBottom: 14 },
  featureLink: {},
  featureLinkTxt: { fontSize: 14, fontWeight: '600' },

  // Help banner
  helpBanner: {
    flexDirection: isWide ? 'row' : 'column', alignItems: isWide ? 'center' : 'flex-start',
    justifyContent: 'space-between', backgroundColor: '#f0f9ff',
    marginHorizontal: 20, marginVertical: 8, borderRadius: 16,
    padding: 24, gap: 16, borderWidth: 1, borderColor: '#bae6fd',
  },
  helpLeft: {},
  helpTitle: { fontSize: 22, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
  helpSub: { fontSize: 14, color: '#64748b' },
  helpBtn: { backgroundColor: '#6366f1', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  helpBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Testimonials
  testimonialsRow: { gap: 16 },
  testimonialsRowWide: { flexDirection: 'row' },
  testimonialCard: {
    backgroundColor: '#f8fafc', borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  testimonialCardWide: { flex: 1 },
  testimonialText: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 20, fontStyle: 'italic' },
  testimonialAuthor: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  testimonialAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366f1',
    alignItems: 'center', justifyContent: 'center',
  },
  testimonialAvatarTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  testimonialName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  testimonialRole: { fontSize: 12, color: '#64748b' },
  testimonialCompany: { fontSize: 12, color: '#6366f1', fontWeight: '600' },

  // FAQ
  faqSection: { backgroundColor: '#f8fafc' },
  faqList: { maxWidth: 720, alignSelf: 'center', width: '100%' },
  faqItem: {
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
    paddingVertical: 20,
  },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  faqQ: { fontSize: 15, fontWeight: '600', color: '#1e293b', flex: 1, lineHeight: 22 },
  faqA: { fontSize: 14, color: '#64748b', marginTop: 12, lineHeight: 22 },

  // Footer CTA
  footerCta: { padding: 48, alignItems: 'center' },
  footerCtaTitle: { fontSize: isWide ? 28 : 22, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
  footerCtaSub: { fontSize: 15, color: '#e0e7ff', textAlign: 'center', marginBottom: 24 },
  footerCtaBtn: { backgroundColor: '#ffffff', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8 },
  footerCtaBtnTxt: { color: '#6366f1', fontSize: 15, fontWeight: '700' },
});

export default EmployerOptionsScreen;
