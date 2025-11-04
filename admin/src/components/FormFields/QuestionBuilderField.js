import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/theme';
import Input from '../Input';

const QuestionBuilderField = ({ label, value = [], onSelect, error, required }) => {
  const [questions, setQuestions] = useState(value || []);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  const questionTypes = [
    { value: 'dropdown', label: 'Dropdown', icon: 'list-outline' },
    { value: 'checkboxes', label: 'Checkboxes', icon: 'checkbox-outline' },
    { value: 'number', label: 'Number', icon: 'calculator-outline' },
    { value: 'text', label: 'Text', icon: 'text-outline' },
    { value: 'textarea', label: 'Textarea', icon: 'document-text-outline' },
    { value: 'upload', label: 'Upload Field', icon: 'cloud-upload-outline' },
  ];

  const createNewQuestion = () => {
    const newQuestion = {
      id: `question_${Date.now()}`,
      type: 'dropdown',
      title: '',
      multiSelect: false,
      mandatory: false,
      requireCorrectAnswer: false,
      options: [{ id: `option_${Date.now()}`, text: '', isCorrect: false }],
    };
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    setExpandedQuestionId(newQuestion.id);
    onSelect(updatedQuestions);
  };

  const updateQuestion = (questionId, field, value) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId ? { ...q, [field]: value } : q
    );
    setQuestions(updatedQuestions);
    onSelect(updatedQuestions);
  };

  const deleteQuestion = (questionId) => {
    const updatedQuestions = questions.filter((q) => q.id !== questionId);
    setQuestions(updatedQuestions);
    onSelect(updatedQuestions);
    if (expandedQuestionId === questionId) {
      setExpandedQuestionId(null);
    }
  };

  const addOption = (questionId) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          options: [
            ...q.options,
            { id: `option_${Date.now()}`, text: '', isCorrect: false },
          ],
        };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    onSelect(updatedQuestions);
  };

  const updateOption = (questionId, optionId, field, value) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map((opt) =>
            opt.id === optionId ? { ...opt, [field]: value } : opt
          ),
        };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    onSelect(updatedQuestions);
  };

  const deleteOption = (questionId, optionId) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.filter((opt) => opt.id !== optionId),
        };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    onSelect(updatedQuestions);
  };

  const toggleExpanded = (questionId) => {
    setExpandedQuestionId(expandedQuestionId === questionId ? null : questionId);
  };

  const renderQuestionTypeSelector = (question) => {
    return (
      <View style={styles.questionTypesContainer}>
        <Text style={styles.sectionLabel}>Select Question Type</Text>
        <View style={styles.questionTypesGrid}>
          {questionTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.questionTypeButton,
                question.type === type.value && styles.questionTypeButtonActive,
              ]}
              onPress={() => updateQuestion(question.id, 'type', type.value)}
            >
              <Ionicons
                name={type.icon}
                size={24}
                color={question.type === type.value ? colors.white : colors.text}
              />
              <Text
                style={[
                  styles.questionTypeLabel,
                  question.type === type.value && styles.questionTypeLabelActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderQuestionOptions = (question) => {
    // Only show options for dropdown and checkboxes
    if (question.type !== 'dropdown' && question.type !== 'checkboxes') {
      return null;
    }

    return (
      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <View key={option.id} style={styles.optionRow}>
            <View style={styles.optionInputContainer}>
              <Input
                value={option.text}
                onChangeText={(text) =>
                  updateOption(question.id, option.id, 'text', text)
                }
                placeholder="Type option text here..."
                style={styles.optionInput}
              />
            </View>

            <View style={styles.correctAnswerToggle}>
              <Text style={styles.correctAnswerLabel}>Correct Answer</Text>
              <Switch
                value={option.isCorrect}
                onValueChange={(val) =>
                  updateOption(question.id, option.id, 'isCorrect', val)
                }
                trackColor={{ false: colors.borderLight, true: colors.success }}
                thumbColor={option.isCorrect ? colors.white : colors.white}
              />
            </View>

            {question.options.length > 1 && (
              <TouchableOpacity
                style={styles.deleteOptionButton}
                onPress={() => deleteOption(question.id, option.id)}
              >
                <Ionicons name="close-circle" size={24} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.addOptionButton}
          onPress={() => addOption(question.id)}
        >
          <Ionicons name="add-circle" size={24} color={colors.success} />
          <Text style={styles.addOptionText}>Add Option</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuestion = (question, index) => {
    const isExpanded = expandedQuestionId === question.id;

    return (
      <View key={question.id} style={styles.questionCard}>
        <TouchableOpacity
          style={styles.questionHeader}
          onPress={() => toggleExpanded(question.id)}
        >
          <View style={styles.questionHeaderLeft}>
            <View style={styles.questionTypeIcon}>
              <Ionicons
                name={
                  questionTypes.find((t) => t.value === question.type)?.icon ||
                  'list-outline'
                }
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.questionHeaderInfo}>
              <Text style={styles.questionHeaderTitle}>
                {question.title || `Question ${index + 1}`}
              </Text>
              <Text style={styles.questionHeaderType}>
                {questionTypes.find((t) => t.value === question.type)?.label}
              </Text>
            </View>
          </View>

          <View style={styles.questionHeaderRight}>
            <TouchableOpacity
              style={styles.deleteQuestionButton}
              onPress={() => deleteQuestion(question.id)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={colors.text}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.questionBody}>
            {/* Question Settings */}
            <View style={styles.settingsRow}>
              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>Multi Select Answers</Text>
                <Switch
                  value={question.multiSelect}
                  onValueChange={(val) =>
                    updateQuestion(question.id, 'multiSelect', val)
                  }
                  trackColor={{ false: colors.borderLight, true: colors.error }}
                  thumbColor={question.multiSelect ? colors.white : colors.white}
                  disabled={question.type !== 'checkboxes'}
                />
              </View>

              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>Mandatory</Text>
                <Switch
                  value={question.mandatory}
                  onValueChange={(val) =>
                    updateQuestion(question.id, 'mandatory', val)
                  }
                  trackColor={{ false: colors.borderLight, true: colors.error }}
                  thumbColor={question.mandatory ? colors.white : colors.white}
                />
              </View>
            </View>

            {/* Question Title */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Question Title</Text>
              <Input
                value={question.title}
                onChangeText={(text) => updateQuestion(question.id, 'title', text)}
                placeholder="Type your question here..."
              />
            </View>

            {/* Require Correct Answer */}
            {(question.type === 'dropdown' || question.type === 'checkboxes') && (
              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>
                  Require correct answer on apply job
                </Text>
                <Switch
                  value={question.requireCorrectAnswer}
                  onValueChange={(val) =>
                    updateQuestion(question.id, 'requireCorrectAnswer', val)
                  }
                  trackColor={{ false: colors.borderLight, true: colors.error }}
                  thumbColor={question.requireCorrectAnswer ? colors.white : colors.white}
                />
              </View>
            )}

            {/* Question Type Selector */}
            {renderQuestionTypeSelector(question)}

            {/* Question Options */}
            {renderQuestionOptions(question)}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <ScrollView style={styles.questionsContainer} nestedScrollEnabled={true}>
        {questions.map((question, index) => renderQuestion(question, index))}
      </ScrollView>

      <TouchableOpacity style={styles.addQuestionButton} onPress={createNewQuestion}>
        <Text style={styles.addQuestionText}>Add new Question</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  labelContainer: {
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  required: {
    color: colors.error,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  questionsContainer: {
    maxHeight: 600,
  },
  questionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  questionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  questionTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  questionHeaderInfo: {
    flex: 1,
  },
  questionHeaderTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  questionHeaderType: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  questionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deleteQuestionButton: {
    padding: spacing.xs,
  },
  questionBody: {
    padding: spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    flex: 1,
  },
  toggleLabel: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  formLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  questionTypesContainer: {
    marginBottom: spacing.md,
  },
  questionTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  questionTypeButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    minWidth: 100,
  },
  questionTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  questionTypeLabel: {
    ...typography.caption,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  questionTypeLabelActive: {
    color: colors.white,
  },
  optionsContainer: {
    marginTop: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  optionInputContainer: {
    flex: 1,
  },
  optionInput: {
    marginBottom: 0,
  },
  correctAnswerToggle: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  correctAnswerLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  deleteOptionButton: {
    padding: spacing.xs,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.success,
    borderStyle: 'dashed',
    marginTop: spacing.xs,
  },
  addOptionText: {
    ...typography.body,
    color: colors.success,
    marginLeft: spacing.xs,
  },
  addQuestionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  addQuestionText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
});

export default QuestionBuilderField;

