import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView,
  Image,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
  Dimensions,
  Animated as RNAnimated,
  Easing,
  Modal
} from 'react-native';
import { Plus, Send, Sparkles, Paperclip, X, Image as ImageIcon, FileText, Menu, ChevronLeft, PlusSquare, Clock, Settings, Loader2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { BlurView } from 'expo-blur';
import { useChat } from '@ai-sdk/react';
import { LinearGradient } from 'expo-linear-gradient';
import DarkMidnightMeshBackground from './components/DarkMidnightMeshBackground';
import DarkEmberBackground from './components/DarkEmberBackground';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const { width, height } = Dimensions.get('window');

// A safe, dependency-free mini-markdown renderer for chat with blinking cursor for the active message
const renderFormattedText = (text, isUser, isStreaming) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|```[\s\S]*?```)/g);
  
  return (
    <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.modelMessageText]}>
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          return <Text key={i} style={styles.codeBlock}>{part.slice(3, -3)}</Text>;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <Text key={i} style={styles.boldText}>{part.slice(2, -2)}</Text>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <Text key={i} style={styles.inlineCode}>{part.slice(1, -1)}</Text>;
        }
        return <Text key={i}>{part}</Text>;
      })}
      {isStreaming && <Text style={styles.blinkingCursor}> █</Text>}
    </Text>
  );
};

// TypeWriter component to ensure MS Word style typing effect on React Native
const TypeWriterText = ({ text, isLatest }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!isLatest) {
      setDisplayedText(text);
      return;
    }
    if (text.length > displayedText.length) {
      let currentIndex = displayedText.length;
      const interval = setInterval(() => {
        currentIndex += 2; // Speed of typing
        if (currentIndex >= text.length) {
          currentIndex = text.length;
          clearInterval(interval);
        }
        setDisplayedText(text.slice(0, currentIndex));
      }, 15);
      return () => clearInterval(interval);
    }
  }, [text, isLatest]);

  const isTyping = isLatest && displayedText.length < text.length;
  return renderFormattedText(displayedText, false, isTyping);
};

export default function App() {
  const scrollViewRef = useRef();
  const [attachments, setAttachments] = useState([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [bgTheme, setBgTheme] = useState('midnight');
  useEffect(() => {
    setBgTheme('midnight');
  }, []);

  const scanAnim = useRef(new RNAnimated.Value(-width)).current;
  const spinAnim = useRef(new RNAnimated.Value(0)).current;
  const plusRotationAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {

    RNAnimated.loop(
      RNAnimated.timing(scanAnim, { toValue: width, duration: 2000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    RNAnimated.loop(
      RNAnimated.timing(spinAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const { messages, input, setInput, append, isLoading, setMessages } = useChat({
    api: 'https://sai-website-app.vercel.app/api/chat', 
    initialMessages: [
      { id: '1', role: 'assistant', content: "Welcome to **SAi**.\nI am ready to assist you. What shall we create today?" }
    ],
    onError: (err) => {
      console.error("Chat error:", err);
    },
    onFinish: () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    }
  });

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setShowAttachMenu(false);
      RNAnimated.timing(plusRotationAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      const asset = result.assets[0];
      const base64Data = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
      setAttachments(prev => [...prev, {
        uri: asset.uri, type: 'image', base64: base64Data, name: asset.fileName || 'image.jpg', mimeType: asset.mimeType || 'image/jpeg'
      }]);
    }
  };

  const handlePickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: ['text/plain', 'text/csv', 'application/json', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true
    });

    if (result.canceled === false) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setShowAttachMenu(false);
      RNAnimated.timing(plusRotationAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      const asset = result.assets[0];
      try {
        const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
        const base64Data = `data:${asset.mimeType || 'application/octet-stream'};base64,${base64}`;
        
        setAttachments(prev => [...prev, {
          uri: asset.uri, type: 'document', base64: base64Data, name: asset.name, mimeType: asset.mimeType
        }]);
      } catch (err) {
        console.error("Error reading file:", err);
      }
    }
  };

  const onSend = () => {
    const textToSend = (input || '').trim();
    if (!textToSend && attachments.length === 0) return;
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    
    // Format attachments exactly how the Vercel AI SDK expects them
    // experimental_attachments for standard SDK, but our custom backend might need it in a specific format.
    // We send it via append data.
    
    append({
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      // For standard Vercel AI SDK:
      experimental_attachments: attachments.length > 0 ? attachments.map(a => ({
        url: a.base64,
        name: a.name,
        contentType: a.mimeType
      })) : undefined
    });
    
    // If the backend strictly needs it in message.attachments
    // The web version expects messages[i].attachments to have dataUrl. We will handle that if needed, 
    // but the API route checks for att.dataUrl in the attachments array.
    
    setInput('');
    setAttachments([]);
    setShowAttachMenu(false);
    RNAnimated.timing(plusRotationAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
  };

  const removeAttachment = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleNewChat = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setMessages([{ id: Date.now().toString(), role: 'assistant', content: "Starting a new conversation. How can I help?" }]);
  };
  
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const plusRotate = plusRotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      
      {/* Web Backgrounds */}
      {bgTheme === 'midnight' ? <DarkMidnightMeshBackground /> : <DarkEmberBackground />}

      {/* UI Area */}
      <View style={styles.safeArea}>
        <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Custom Minimalist Header with New Features */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={() => setShowHistory(true)}>
              <HistoryIcon />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <LinearGradient
                colors={['#00D4FF', '#007BFF']}
                start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                style={styles.headerIconBg}
              >
                <Sparkles size={16} color="#fff" />
              </LinearGradient>
              <Text style={styles.headerTitle}>SAi</Text>
            </View>
            
            <View style={styles.headerRightControls}>
              <TouchableOpacity style={[styles.headerButton, {marginRight: 8}]} onPress={() => {
                if (typeof handleNewChat === 'function') handleNewChat();
                else setMessages([]);
              }}>
                <PlusSquare color="#FFF" size={20} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={() => setShowSettings(true)}>
                <Settings color="#FFF" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Chat Area */}
          <ScrollView 
            style={styles.chatArea}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 1 && (
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
              </View>
            )}

            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isLastAndLoading = !isUser && index === messages.length - 1 && isLoading;
              
              return (
                <View 
                  key={msg.id} 
                  style={[
                    styles.messageWrapper,
                    isUser ? styles.userWrapper : styles.modelWrapper
                  ]}
                >
                  {!isUser && (
                    <View style={styles.modelAvatarSmall}>
                      <Sparkles size={12} color="#B026FF" />
                    </View>
                  )}
                  
                  {isUser ? (
                    <LinearGradient
                      colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                      start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                      style={[styles.messageBubble, styles.userBubble]}
                    >
                      {/* Attachments preview inside user bubble */}
                      {msg.experimental_attachments && msg.experimental_attachments.length > 0 && (
                        <View style={{flexDirection: 'row', marginBottom: 8}}>
                           {msg.experimental_attachments.map((a, i) => (
                             <View key={i} style={styles.inBubbleAttachment}>
                               {a.contentType?.startsWith('image') ? (
                                  <Image source={{uri: a.url}} style={styles.inBubbleImage} />
                               ) : (
                                  <FileText color="#E0A0FF" size={24} />
                               )}
                             </View>
                           ))}
                        </View>
                      )}
                      {renderFormattedText(msg.content, isUser, false)}
                    </LinearGradient>
                  ) : (
                    <View style={[styles.messageBubble, styles.modelBubble]}>
                      <TypeWriterText text={msg.content} isLatest={index === messages.length - 1} />
                    </View>
                  )}
                </View>
              );
            })}
            
            {/* The Big Thinking Animation */}
            {isLoading && messages[messages.length - 1].role === 'user' && (
              <View style={[styles.messageWrapper, styles.modelWrapper]}>
                 <View style={styles.modelAvatarSmall}>
                    <Sparkles size={12} color="#B026FF" />
                 </View>
                 <View style={[styles.messageBubble, styles.modelBubble, { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }]}>
                    <RNAnimated.View style={{ transform: [{ rotate: spin }] }}>
                       <Loader2 color="#B026FF" size={20} />
                    </RNAnimated.View>
                    <Text style={{color: '#B026FF', marginLeft: 12, fontSize: 14, fontWeight: '700', letterSpacing: 2}}>THINKING...</Text>
                 </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Loading Light (Glowing horizontal scanner) */}
          {isLoading && (
            <View style={styles.scannerLineContainer}>
              <RNAnimated.View style={[styles.scannerLine, { transform: [{ translateX: scanAnim }] }]} />
            </View>
          )}

          {/* Floating Dock Input Area */}
          <View style={styles.dockWrapper}>
            {/* Attachment Menu Popup */}
            {showAttachMenu && (
              <View style={styles.attachMenu}>
                <TouchableOpacity style={styles.attachMenuItem} onPress={handlePickDocument}>
                  <View style={styles.attachMenuIcon}>
                    <FileText color="#E0A0FF" size={20} />
                  </View>
                  <Text style={styles.attachMenuText}>Document</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachMenuItem} onPress={handlePickImage}>
                  <View style={styles.attachMenuIcon}>
                    <ImageIcon color="#E0A0FF" size={20} />
                  </View>
                  <Text style={styles.attachMenuText}>Photo & Video</Text>
                </TouchableOpacity>
              </View>
            )}

            {attachments.length > 0 && (
              <View style={styles.attachmentsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {attachments.map((att, index) => (
                    <View key={index} style={styles.attachmentWrapper}>
                      {att.type === 'image' ? (
                        <Image source={{ uri: att.uri }} style={styles.attachmentImage} />
                      ) : (
                        <View style={styles.attachmentDoc}>
                          <FileText color="#B026FF" size={24} />
                          <Text style={styles.attachmentDocText} numberOfLines={1}>{att.name}</Text>
                        </View>
                      )}
                      <TouchableOpacity style={styles.attachmentRemove} onPress={() => removeAttachment(index)}>
                        <X color="#fff" size={12} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.dockContainer}>
              <View style={styles.dockTools}>
                <TouchableOpacity 
                  style={styles.toolButton} 
                  onPress={() => {
                    const toValue = showAttachMenu ? 0 : 1;
                    RNAnimated.spring(plusRotationAnim, {
                      toValue,
                      friction: 5,
                      tension: 40,
                      useNativeDriver: true
                    }).start();
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                    setShowAttachMenu(!showAttachMenu);
                  }}
                >
                  <RNAnimated.View style={{ transform: [{ rotate: plusRotate }] }}>
                    <Plus color={showAttachMenu ? "#B026FF" : "#AAA"} size={22} />
                  </RNAnimated.View>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.dockInput}
                placeholder="Type a message..."
                placeholderTextColor="#666"
                value={input}
                onChangeText={setInput}
                multiline
              />

              <TouchableOpacity 
                style={styles.dockSendButton}
                onPress={onSend}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={((input || '').trim() || attachments.length > 0) ? ['#B026FF', '#4A00E0'] : ['#333', '#222']}
                  start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                  style={styles.dockSendGradient}
                >
                  <Send color={((input || '').trim() || attachments.length > 0) ? "#FFF" : "#777"} size={16} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        </SafeAreaView>
      </View>

      {/* History Modal */}
      <Modal visible={showHistory} animationType="slide" transparent={true}>
        <BlurView intensity={90} tint="dark" style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chat History</Text>
            <TouchableOpacity onPress={() => setShowHistory(false)} style={styles.modalClose}>
              <X color="#FFF" size={24} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalEmpty}>No past memories found yet.</Text>
          </ScrollView>
        </BlurView>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="fade" transparent={true}>
        <BlurView intensity={90} tint="dark" style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>SAi Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)} style={styles.modalClose}>
              <X color="#FFF" size={24} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <TouchableOpacity style={styles.settingsOption}>
              <Text style={styles.settingsOptionText}>Model: Opus 5.5</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsOption}>
              <Text style={styles.settingsOptionText}>Voice Output: Off</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsOption} onPress={() => { setMessages([]); setShowSettings(false); }}>
              <Text style={[styles.settingsOptionText, {color: '#FF2A55'}]}>Clear Memory & Chat</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}

// History Icon Component
const HistoryIcon = () => <Clock color="#FFF" size={20} />;

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#030008' },
  auroraOrb: { position: 'absolute', borderRadius: 999, opacity: 0.6 },
  orb1: { width: 300, height: 300, backgroundColor: '#7A00FF', top: -50, left: -100 },
  orb2: { width: 400, height: 400, backgroundColor: '#00D4FF', bottom: 50, right: -150, opacity: 0.4 },
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? 50 : 50 },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20, zIndex: 10 },
  headerCenter: { flexDirection: 'row', alignItems: 'center' },
  headerIconBg: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10, shadowColor: '#B026FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  headerRightControls: { flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chatArea: { flex: 1 },
  welcomeContainer: { alignItems: 'center', marginVertical: 20 },
  welcomeDate: { color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, fontWeight: '600' },
  messageWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 24, maxWidth: width * 0.85 },
  userWrapper: { alignSelf: 'flex-end' },
  modelWrapper: { alignSelf: 'flex-start' },
  modelAvatarSmall: { width: 24, height: 24, borderRadius: 8, backgroundColor: 'rgba(0, 212, 255, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: 'rgba(0, 212, 255, 0.3)' },
  messageBubble: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 20 },
  userBubble: { borderBottomRightRadius: 4, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 3 },
  modelBubble: { backgroundColor: 'transparent', paddingHorizontal: 0, paddingVertical: 4 },
  messageText: { fontSize: 16, lineHeight: 26, letterSpacing: 0.2 },
  userMessageText: { color: '#FFF', fontWeight: '500' },
  modelMessageText: { color: '#EAEAEA', fontWeight: '400' },
  boldText: { fontWeight: '800', color: '#FFF' },
  inlineCode: { backgroundColor: 'rgba(255,255,255,0.1)', color: '#00D4FF', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, fontSize: 14 },
  codeBlock: { backgroundColor: 'rgba(0,0,0,0.4)', color: '#00D4FF', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', fontSize: 13, marginTop: 8, marginBottom: 8, overflow: 'hidden', lineHeight: 20 },
  blinkingCursor: { color: '#00D4FF', opacity: 0.8 },
  inBubbleAttachment: { width: 60, height: 60, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', marginRight: 10, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  inBubbleImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  scannerLineContainer: { height: 2, backgroundColor: 'rgba(0, 212, 255, 0.1)', overflow: 'hidden', marginBottom: 10 },
  scannerLine: { width: 150, height: '100%', backgroundColor: '#00D4FF', shadowColor: '#00D4FF', shadowOffset: {width: 0, height: 0}, shadowOpacity: 1, shadowRadius: 8, elevation: 5 },
  dockWrapper: { paddingHorizontal: 16, paddingBottom: Platform.OS === 'ios' ? 16 : 24, paddingTop: 10 },
  attachmentsContainer: { marginBottom: 16, marginLeft: 8 },
  attachmentWrapper: { marginRight: 12, position: 'relative' },
  attachmentImage: { width: 70, height: 70, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  attachmentDoc: { width: 70, height: 70, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  attachmentDocText: { color: '#AAA', fontSize: 10, marginTop: 8, fontWeight: '600' },
  attachmentRemove: { position: 'absolute', top: -6, right: -6, backgroundColor: '#FF2A55', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#030008' },
  attachMenu: { backgroundColor: 'rgba(10, 15, 30, 0.95)', borderRadius: 20, padding: 8, position: 'absolute', bottom: 80, left: 16, width: 180, borderWidth: 1, borderColor: 'rgba(0, 212, 255, 0.3)', shadowColor: '#00D4FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8, zIndex: 20 },
  attachMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12 },
  attachMenuIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(0, 212, 255, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  attachMenuText: { color: '#FFF', fontSize: 15, fontWeight: '500' },
  dockContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 6, paddingVertical: 6, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(0, 212, 255, 0.25)', backgroundColor: 'rgba(5, 10, 20, 0.85)', overflow: 'hidden' },
  dockTools: { flexDirection: 'row', alignItems: 'center', paddingBottom: 4, paddingLeft: 4 },
  toolButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, marginRight: 4 },
  dockInput: { flex: 1, color: '#fff', fontSize: 16, maxHeight: 120, minHeight: 40, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 12 },
  dockSendButton: { paddingBottom: 2, paddingRight: 2 },
  dockSendGradient: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', shadowColor: '#00D4FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  
  modalContainer: { flex: 1, backgroundColor: 'rgba(5,0,10,0.8)' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalTitle: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  modalClose: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  modalBody: { flex: 1, padding: 20 },
  modalEmpty: { color: '#666', fontSize: 16, textAlign: 'center', marginTop: 40 },
  settingsOption: { paddingVertical: 18, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  settingsOptionText: { color: '#FFF', fontSize: 18, fontWeight: '500' }
});
