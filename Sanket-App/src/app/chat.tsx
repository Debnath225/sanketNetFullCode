import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { useSanket } from '@/context/SanketContext';
import * as api from '@/services/api';

interface SourceItem {
  kind: string;
  summary: string;
  timestamp: string;
  score: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: SourceItem[];
  provider?: 'local' | 'llm';
  isPending?: boolean;
}

const QUICK_PROMPTS = [
  {
    icon: '🌧️',
    title: 'Flood Risk Assessment',
    prompt: 'What is the current flood and precipitation risk across our monitoring sectors?',
  },
  {
    icon: '🌊',
    title: 'Water Level Status',
    prompt: 'Which sensor nodes are detecting water level surge or approaching danger mark?',
  },
  {
    icon: '🎒',
    title: 'Emergency Go-Bag',
    prompt: 'What are the essential items and documents needed in an emergency flood evacuation Go-Bag?',
  },
  {
    icon: '📍',
    title: 'Relief Shelters',
    prompt: 'Where are the designated high-ground disaster relief shelters and what are their capacities?',
  },
];

export default function ChatScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { connection, selectedArea } = useSanket();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello! I am Sankat AI, your real-time disaster intelligence assistant. 🛡️\n\nI analyze live hydrological sensors, rainfall gauges, and early warning vectors across **${selectedArea.name}**.\n\nHow can I assist your sector response today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: 'llm',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSourcesId, setExpandedSourcesId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 150);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const assistantPlaceholderId = `assistant-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      id: userMessageId,
      role: 'user',
      content: textToSend,
      timestamp: timeStr,
    };

    const pendingMsg: Message = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: 'Analyzing sensor telemetry and sector advisories...',
      timestamp: timeStr,
      isPending: true,
    };

    setMessages((prev) => [...prev, userMsg, pendingMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await api.askChat(textToSend, conversationId || undefined);

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholderId
            ? {
                id: `assistant-resolved-${Date.now()}`,
                role: 'assistant',
                content: response.answer,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sources: response.sources,
                provider: response.provider,
                isPending: false,
              }
            : msg,
        ),
      );
    } catch (err: any) {
      const errorMsg =
        err?.error === 'question_too_long'
          ? 'Question is too long (maximum 1,000 characters).'
          : err?.status === 401
          ? 'Session expired. Please sign in again.'
          : 'Unable to reach disaster intelligence server. Please check connection.';

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholderId
            ? {
                id: `assistant-error-${Date.now()}`,
                role: 'assistant',
                content: `⚠️ ${errorMsg}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isPending: false,
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `New session started. Ready to query live sensors, risk models, and civil safety guidance for **${selectedArea.name}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'llm',
      },
    ]);
  };

  const copyToClipboard = (text: string, id: string) => {
    try {
      Clipboard.setString(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* clipboard fallback */
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    const isSourcesExpanded = expandedSourcesId === item.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.messageContainerUser : styles.messageContainerAssistant,
        ]}
      >
        <View
          style={[
            styles.avatarCircle,
            isUser
              ? { backgroundColor: theme.primary }
              : { backgroundColor: `${theme.primary}20`, borderColor: theme.primary, borderWidth: 1 },
          ]}
        >
          {isUser ? (
            <Feather name="user" size={14} color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons name="robot-outline" size={16} color={theme.primary} />
          )}
        </View>

        <View style={styles.messageContentWrapper}>
          <View style={[styles.metaRow, isUser && { justifyContent: 'flex-end' }]}>
            <Text style={[styles.roleText, { color: theme.textSecondary }]}>
              {isUser ? 'You' : 'Sanket AI'}
            </Text>
            {!isUser && item.provider && !item.isPending && (
              <View
                style={[
                  styles.providerBadge,
                  {
                    backgroundColor: item.provider === 'llm' ? `${theme.primary}18` : `${theme.warning}18`,
                    borderColor: item.provider === 'llm' ? `${theme.primary}40` : `${theme.warning}40`,
                  },
                ]}
              >
                <Feather
                  name={item.provider === 'llm' ? 'cpu' : 'zap'}
                  size={10}
                  color={item.provider === 'llm' ? theme.primary : theme.warning}
                />
                <Text
                  style={[
                    styles.providerBadgeText,
                    { color: item.provider === 'llm' ? theme.primary : theme.warning },
                  ]}
                >
                  {item.provider === 'llm' ? 'Groq RAG' : 'Local Sensor Engine'}
                </Text>
              </View>
            )}
            <Text style={[styles.timestampText, { color: theme.textSecondary }]}>
              {item.timestamp}
            </Text>
          </View>

          <View
            style={[
              styles.bubble,
              isUser
                ? { backgroundColor: theme.primary, borderTopRightRadius: 4 }
                : {
                    backgroundColor: theme.surface,
                    borderColor: theme.cardBorder,
                    borderWidth: 1,
                    borderTopLeftRadius: 4,
                  },
            ]}
          >
            {item.isPending ? (
              <View style={styles.pendingRow}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={[styles.pendingText, { color: theme.textSecondary }]}>
                  {item.content}
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.messageText,
                  { color: isUser ? '#FFFFFF' : theme.text },
                ]}
                selectable
              >
                {item.content}
              </Text>
            )}
          </View>

          {!isUser && !item.isPending && (
            <View style={styles.assistantActionBar}>
              <TouchableOpacity
                style={[styles.copyBtn, { borderColor: theme.cardBorder }]}
                onPress={() => copyToClipboard(item.content, item.id)}
                activeOpacity={0.7}
              >
                <Feather
                  name={copiedId === item.id ? 'check' : 'copy'}
                  size={12}
                  color={copiedId === item.id ? theme.success : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.copyBtnText,
                    { color: copiedId === item.id ? theme.success : theme.textSecondary },
                  ]}
                >
                  {copiedId === item.id ? 'Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>

              {item.sources && item.sources.length > 0 && (
                <TouchableOpacity
                  style={[
                    styles.sourcesToggleBtn,
                    {
                      borderColor: theme.cardBorder,
                      backgroundColor: isSourcesExpanded ? `${theme.primary}15` : 'transparent',
                    },
                  ]}
                  onPress={() =>
                    setExpandedSourcesId(isSourcesExpanded ? null : item.id)
                  }
                  activeOpacity={0.7}
                >
                  <Feather
                    name="database"
                    size={12}
                    color={isSourcesExpanded ? theme.primary : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.sourcesToggleText,
                      { color: isSourcesExpanded ? theme.primary : theme.textSecondary },
                    ]}
                  >
                    {item.sources.length} Sensor {item.sources.length === 1 ? 'Source' : 'Sources'}
                  </Text>
                  <Feather
                    name={isSourcesExpanded ? 'chevron-up' : 'chevron-down'}
                    size={12}
                    color={isSourcesExpanded ? theme.primary : theme.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          {!isUser && isSourcesExpanded && item.sources && (
            <View
              style={[
                styles.sourcesDrawer,
                { backgroundColor: `${theme.backgroundElement}`, borderColor: theme.cardBorder },
              ]}
            >
              <Text style={[styles.sourcesDrawerTitle, { color: theme.primary }]}>
                ◈ Grounded Live Sources
              </Text>
              {item.sources.map((src, idx) => (
                <View
                  key={`src-${idx}`}
                  style={[styles.sourceItemCard, { borderColor: theme.cardBorder }]}
                >
                  <View style={styles.sourceItemHeader}>
                    <View style={styles.sourceBadgeRow}>
                      <Text style={[styles.sourceKindBadge, { color: theme.primary }]}>
                        {src.kind.toUpperCase()}
                      </Text>
                      {src.score > 0 && (
                        <Text style={[styles.sourceScoreText, { color: theme.textSecondary }]}>
                          Relevance: {Math.round(src.score * 100)}%
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.sourceTimeText, { color: theme.textSecondary }]}>
                      {src.timestamp ? new Date(src.timestamp).toLocaleTimeString() : 'Live'}
                    </Text>
                  </View>
                  <Text style={[styles.sourceSummaryText, { color: theme.text }]}>
                    {src.summary}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 16),
            backgroundColor: theme.surface,
            borderBottomColor: theme.cardBorder,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.botIconWrapper, { backgroundColor: `${theme.primary}20` }]}>
            <MaterialCommunityIcons name="robot-happy" size={20} color={theme.primary} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Sankat AI Assistant
              </Text>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: connection.isConnected ? theme.success : theme.warning },
                ]}
              />
            </View>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {connection.isConnected
                ? `Live Grounding • ${selectedArea.name}`
                : 'Offline Engine • Local Fallback'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.newChatBtn,
            { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder },
          ]}
          onPress={handleNewChat}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={15} color={theme.primary} />
          <Text style={[styles.newChatText, { color: theme.primary }]}>New</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.contentArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={[styles.messagesList, { paddingBottom: 16 }]}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            messages.length <= 1 ? (
              <View style={styles.promptChipsContainer}>
                <Text style={[styles.promptChipsHeading, { color: theme.textSecondary }]}>
                  RECOMMENDED DISASTER INQUIRIES
                </Text>
                <View style={styles.promptChipsGrid}>
                  {QUICK_PROMPTS.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.promptChip,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.cardBorder,
                        },
                      ]}
                      onPress={() => handleSend(item.prompt)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.promptChipIcon}>{item.icon}</Text>
                      <View style={styles.promptChipContent}>
                        <Text style={[styles.promptChipTitle, { color: theme.text }]}>
                          {item.title}
                        </Text>
                        <Text
                          style={[styles.promptChipText, { color: theme.textSecondary }]}
                          numberOfLines={2}
                        >
                          {item.prompt}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null
          }
        />

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.surface,
              borderTopColor: theme.cardBorder,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <View
            style={[
              styles.inputBoxWrapper,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <TextInput
              style={[styles.textInput, { color: theme.text }]}
              placeholder="Ask about water levels, evacuation, or flood forecasts..."
              placeholderTextColor={theme.textSecondary}
              value={inputQuery}
              onChangeText={setInputQuery}
              multiline
              maxLength={1000}
              editable={!isLoading}
              onSubmitEditing={() => handleSend()}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor:
                    inputQuery.trim().length > 0 && !isLoading
                      ? theme.primary
                      : `${theme.primary}40`,
                },
              ]}
              onPress={() => handleSend()}
              disabled={inputQuery.trim().length === 0 || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Feather name="send" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  newChatText: {
    fontSize: 13,
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    gap: 10,
    maxWidth: '100%',
  },
  messageContainerUser: {
    flexDirection: 'row-reverse',
  },
  messageContainerAssistant: {
    flexDirection: 'row',
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  messageContentWrapper: {
    flex: 1,
    maxWidth: '85%',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  providerBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  timestampText: {
    fontSize: 11,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pendingText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  assistantActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '500',
  },
  sourcesToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  sourcesToggleText: {
    fontSize: 11,
    fontWeight: '500',
  },
  sourcesDrawer: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  sourcesDrawerTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sourceItemCard: {
    borderLeftWidth: 2,
    paddingLeft: 8,
    paddingVertical: 2,
  },
  sourceItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sourceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourceKindBadge: {
    fontSize: 10,
    fontWeight: '700',
  },
  sourceScoreText: {
    fontSize: 10,
  },
  sourceTimeText: {
    fontSize: 10,
  },
  sourceSummaryText: {
    fontSize: 12,
    lineHeight: 16,
  },
  promptChipsContainer: {
    marginTop: 18,
    paddingTop: 16,
    gap: 10,
  },
  promptChipsHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  promptChipsGrid: {
    gap: 10,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  promptChipIcon: {
    fontSize: 22,
  },
  promptChipContent: {
    flex: 1,
  },
  promptChipTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  promptChipText: {
    fontSize: 12,
    lineHeight: 16,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  inputBoxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    fontSize: 14,
    paddingVertical: 6,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
