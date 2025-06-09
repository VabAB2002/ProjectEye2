import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useMilestoneStore } from '../../store/milestone.store';
import { useProjectStore } from '../../store/project.store';

interface CreateMilestoneScreenParams {
  projectId?: string;
  parentMilestoneId?: string;
}

export const CreateMilestoneScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { projectId, parentMilestoneId } = route.params as CreateMilestoneScreenParams;
  
  const { createMilestone, createFromTemplate, isLoading } = useMilestoneStore();
  const { projects } = useProjectStore();
  
  const [creationType, setCreationType] = useState<'template' | 'custom'>('template');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [inputErrors, setInputErrors] = useState<{[key: string]: string}>({});
  const [fadeAnim] = useState(new Animated.Value(0));

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    orderIndex: 0,
  });

  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  const templateOptions = [
    {
      type: 'RESIDENTIAL',
      icon: 'home-outline',
      label: 'Residential Project',
      description: 'Pre-built milestones for house construction',
      color: '#10B981',
      milestones: [
        'Site Preparation & Excavation',
        'Foundation Work',
        'Structural Framework',
        'Roofing',
        'Plumbing & Electrical',
        'Interior Finishing',
        'Final Inspection'
      ]
    },
    {
      type: 'COMMERCIAL',
      icon: 'business-outline', 
      label: 'Commercial Project',
      description: 'Standard milestones for commercial buildings',
      color: '#0066ff',
      milestones: [
        'Site Survey & Planning',
        'Foundation & Basement',
        'Structural Construction',
        'MEP Installation',
        'Interior Build-out',
        'Safety & Compliance',
        'Handover'
      ]
    }
  ];

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  useEffect(() => {
    if (projects.length === 1 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!selectedProjectId) {
      errors.project = 'Please select a project';
    }

    if (creationType === 'custom') {
      if (!formData.title.trim()) {
        errors.title = 'Milestone title is required';
      }
      if (formData.startDate >= formData.endDate) {
        errors.endDate = 'End date must be after start date';
      }
    } else {
      if (selectedTemplates.length === 0) {
        errors.template = 'Please select at least one template';
      }
    }

    setInputErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      Alert.alert('Please fix the following', firstError);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (creationType === 'template') {
        for (const templateType of selectedTemplates) {
          await createFromTemplate(selectedProjectId, templateType);
        }
        Alert.alert('Success!', 'Milestone templates created successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        await createMilestone(selectedProjectId, {
          parentMilestoneId: parentMilestoneId || undefined,
          name: formData.title,
          description: formData.description || undefined,
          plannedStart: formData.startDate.toISOString(),
          plannedEnd: formData.endDate.toISOString(),
          order: formData.orderIndex,
        });
        
        Alert.alert('Success!', 'Milestone created successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error?.message || 'Failed to create milestone'
      );
    }
  };

  const renderSection = (title: string, icon: keyof typeof Ionicons.glyphMap, content: React.ReactNode) => (
    <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <View style={styles.sectionIcon}>
            <Ionicons name={icon} size={20} color={theme.colors.accent} />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      </View>
      <View style={styles.sectionContent}>
        {content}
      </View>
    </Animated.View>
  );

  const renderProjectSelector = () => {
    if (projectId) return null; // Don't show if projectId is provided

    return renderSection('Select Project', 'business-outline', (
      <View>
        <Text style={styles.sectionDescription}>
          Choose the project for this milestone
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.projectScrollContent}
        >
          {projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={[
                styles.projectCard,
                selectedProjectId === project.id && styles.projectCardActive,
              ]}
              onPress={() => {
                setSelectedProjectId(project.id);
                if (inputErrors.project) {
                  setInputErrors({ ...inputErrors, project: '' });
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.projectCardContent}>
                <View style={[
                  styles.projectIconContainer,
                  selectedProjectId === project.id && styles.projectIconActive,
                ]}>
                  <Ionicons 
                    name={project.type === 'RESIDENTIAL' ? 'home-outline' : 
                          project.type === 'COMMERCIAL' ? 'business-outline' : 'construct-outline'} 
                    size={20} 
                    color={selectedProjectId === project.id ? theme.colors.accent : theme.colors.gray500} 
                  />
                </View>
                <View style={styles.projectInfo}>
                  <Text style={[
                    styles.projectName,
                    selectedProjectId === project.id && styles.projectNameActive,
                  ]}>
                    {project.name}
                  </Text>
                  <Text style={styles.projectType}>{project.type}</Text>
                </View>
                {selectedProjectId === project.id && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.accent} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {inputErrors.project && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={14} color={theme.colors.error} />
            <Text style={styles.errorText}>{inputErrors.project}</Text>
          </View>
        )}
      </View>
    ));
  };

  const renderCreationTypeSelector = () => (
    renderSection('Creation Method', 'options-outline', (
      <View>
        <Text style={styles.sectionDescription}>
          Choose how you want to create milestones
        </Text>
        
        <View style={styles.typeGrid}>
          <TouchableOpacity
            style={[
              styles.typeCard,
              creationType === 'template' && styles.typeCardActive,
            ]}
            onPress={() => setCreationType('template')}
            activeOpacity={0.7}
          >
            <View style={[
              styles.typeIconContainer,
              creationType === 'template' && styles.typeIconContainerActive,
            ]}>
              <Ionicons
                name="library-outline"
                size={28}
                color={creationType === 'template' ? theme.colors.accent : theme.colors.gray500}
              />
            </View>
            <Text style={[
              styles.typeLabel,
              creationType === 'template' && styles.typeLabelActive,
            ]}>
              Use Template
            </Text>
            <Text style={[
              styles.typeDescription,
              creationType === 'template' && styles.typeDescriptionActive,
            ]}>
              Quick setup with pre-built milestones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeCard,
              creationType === 'custom' && styles.typeCardActive,
            ]}
            onPress={() => setCreationType('custom')}
            activeOpacity={0.7}
          >
            <View style={[
              styles.typeIconContainer,
              creationType === 'custom' && styles.typeIconContainerActive,
            ]}>
              <Ionicons
                name="create-outline"
                size={28}
                color={creationType === 'custom' ? theme.colors.accent : theme.colors.gray500}
              />
            </View>
            <Text style={[
              styles.typeLabel,
              creationType === 'custom' && styles.typeLabelActive,
            ]}>
              Custom Milestone
            </Text>
            <Text style={[
              styles.typeDescription,
              creationType === 'custom' && styles.typeDescriptionActive,
            ]}>
              Create a specific milestone
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ))
  );

  const renderTemplateSelector = () => {
    if (creationType !== 'template') return null;

    return renderSection('Select Templates', 'library-outline', (
      <View>
        <Text style={styles.sectionDescription}>
          Choose project templates to create milestones from
        </Text>
        
        {templateOptions.map((template) => (
          <TouchableOpacity
            key={template.type}
            style={[
              styles.templateCard,
              selectedTemplates.includes(template.type) && styles.templateCardActive,
            ]}
            onPress={() => {
              if (selectedTemplates.includes(template.type)) {
                setSelectedTemplates(selectedTemplates.filter(t => t !== template.type));
              } else {
                setSelectedTemplates([...selectedTemplates, template.type]);
              }
              if (inputErrors.template) {
                setInputErrors({ ...inputErrors, template: '' });
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.templateHeader}>
              <View style={[
                styles.templateIconContainer,
                selectedTemplates.includes(template.type) && { backgroundColor: `${template.color}15` },
              ]}>
                <Ionicons 
                  name={template.icon as any} 
                  size={24} 
                  color={selectedTemplates.includes(template.type) ? template.color : theme.colors.gray500} 
                />
              </View>
              <View style={styles.templateInfo}>
                <Text style={[
                  styles.templateLabel,
                  selectedTemplates.includes(template.type) && { color: template.color },
                ]}>
                  {template.label}
                </Text>
                <Text style={styles.templateDescription}>{template.description}</Text>
              </View>
              {selectedTemplates.includes(template.type) && (
                <Ionicons name="checkmark-circle" size={24} color={template.color} />
              )}
            </View>
            
            <View style={styles.milestonePreview}>
              <Text style={styles.previewLabel}>Includes {template.milestones.length} milestones:</Text>
              <View style={styles.previewGrid}>
                {template.milestones.slice(0, 6).map((milestone, index) => (
                  <View key={index} style={styles.previewChip}>
                    <Text style={styles.previewChipText}>{milestone}</Text>
                  </View>
                ))}
                {template.milestones.length > 6 && (
                  <View style={styles.previewChip}>
                    <Text style={[styles.previewChipText, { color: template.color }]}>
                      +{template.milestones.length - 6} more
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        {inputErrors.template && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={14} color={theme.colors.error} />
            <Text style={styles.errorText}>{inputErrors.template}</Text>
          </View>
        )}
      </View>
    ));
  };

  const renderCustomForm = () => {
    if (creationType !== 'custom') return null;

    return renderSection('Milestone Details', 'flag-outline', (
      <View>
        <Text style={styles.sectionDescription}>
          Create a custom milestone with specific details
        </Text>
        
        <Input
          label="Milestone Title"
          placeholder="Enter milestone name"
          value={formData.title}
          onChangeText={(text) => {
            setFormData({ ...formData, title: text });
            if (inputErrors.title) {
              setInputErrors({ ...inputErrors, title: '' });
            }
          }}
          icon="flag-outline"
          variant="filled"
          error={inputErrors.title}
          autoCapitalize="words"
        />

        <Input
          label="Description (Optional)"
          placeholder="Describe what needs to be accomplished"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          variant="filled"
          multiline
          numberOfLines={3}
          autoCapitalize="sentences"
        />

        <View style={styles.dateRow}>
          <View style={styles.dateColumn}>
            <Text style={styles.inputLabel}>Start Date</Text>
            <TouchableOpacity 
              style={styles.dateSelector} 
              onPress={() => setShowStartDate(true)}
              activeOpacity={0.7}
            >
              <View style={styles.dateSelectorContent}>
                <View style={styles.dateIconContainer}>
                  <Ionicons name="calendar-outline" size={16} color={theme.colors.accent} />
                </View>
                <Text style={styles.dateText}>
                  {formData.startDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.gray500} />
            </TouchableOpacity>
          </View>

          <View style={styles.dateColumn}>
            <Text style={styles.inputLabel}>End Date</Text>
            <TouchableOpacity 
              style={[
                styles.dateSelector,
                inputErrors.endDate && styles.dateErrorBorder
              ]} 
              onPress={() => setShowEndDate(true)}
              activeOpacity={0.7}
            >
              <View style={styles.dateSelectorContent}>
                <View style={styles.dateIconContainer}>
                  <Ionicons name="calendar-outline" size={16} color={theme.colors.accent} />
                </View>
                <Text style={styles.dateText}>
                  {formData.endDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.gray500} />
            </TouchableOpacity>
          </View>
        </View>

        {inputErrors.endDate && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={14} color={theme.colors.error} />
            <Text style={styles.errorText}>{inputErrors.endDate}</Text>
          </View>
        )}
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Milestone</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Project Selection */}
          {renderProjectSelector()}

          {/* Creation Type Selection */}
          {selectedProjectId && renderCreationTypeSelector()}

          {/* Template Selection */}
          {selectedProjectId && creationType === 'template' && renderTemplateSelector()}

          {/* Custom Form */}
          {selectedProjectId && creationType === 'custom' && renderCustomForm()}
        </ScrollView>

        {/* Create Button */}
        {selectedProjectId && (
          <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
            <Button
              title={creationType === 'template' ? 'Create from Templates' : 'Create Milestone'}
              onPress={handleSubmit}
              loading={isLoading}
              icon="checkmark-circle-outline"
              fullWidth
            />
          </Animated.View>
        )}
      </KeyboardAvoidingView>

      {/* Date Pickers */}
      {showStartDate && (
        <DateTimePicker
          value={formData.startDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, date) => {
            setShowStartDate(false);
            if (date) {
              setFormData({ ...formData, startDate: date });
              if (inputErrors.endDate) {
                setInputErrors({ ...inputErrors, endDate: '' });
              }
            }
          }}
        />
      )}

      {showEndDate && (
        <DateTimePicker
          value={formData.endDate}
          mode="date"
          display="default"
          minimumDate={new Date(formData.startDate.getTime() + 24 * 60 * 60 * 1000)}
          onChange={(event, date) => {
            setShowEndDate(false);
            if (date) {
              setFormData({ ...formData, endDate: date });
              if (inputErrors.endDate) {
                setInputErrors({ ...inputErrors, endDate: '' });
              }
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    backgroundColor: theme.colors.background,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.gray200,
  },
  typeCardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: `${theme.colors.accent}08`,
  },
  typeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIconContainerActive: {
    backgroundColor: `${theme.colors.accent}15`,
  },
  typeLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  typeLabelActive: {
    color: theme.colors.accent,
  },
  typeDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  typeDescriptionActive: {
    color: theme.colors.accent,
  },
  projectScrollContent: {
    paddingRight: 20,
  },
  projectCard: {
    minWidth: 200,
    padding: 16,
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.gray200,
    marginRight: 12,
  },
  projectCardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: `${theme.colors.accent}08`,
  },
  projectCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectIconActive: {
    backgroundColor: `${theme.colors.accent}15`,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  projectNameActive: {
    color: theme.colors.accent,
  },
  projectType: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  templateCard: {
    padding: 20,
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.gray200,
    marginBottom: 16,
  },
  templateCardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: `${theme.colors.accent}08`,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  templateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  templateInfo: {
    flex: 1,
  },
  templateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  milestonePreview: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: theme.colors.gray100,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  previewChipText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  dateColumn: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  dateSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${theme.colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  dateErrorBorder: {
    borderColor: theme.colors.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginLeft: 6,
    fontWeight: '500',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
});