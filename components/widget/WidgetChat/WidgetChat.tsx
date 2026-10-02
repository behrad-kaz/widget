'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader2, User, Headphones, MessageCircle, Paperclip, Image as ImageIcon, XCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useSocket } from '@/hooks/useSocket';
import { useConversationStore } from '@/stores/conversation.store';
import type { WidgetConfig, Message } from '@/lib/types/widget';

interface WidgetChatProps {
  config: WidgetConfig;
  conversationId: string;
  apiBaseUrl: string;
  onClose: () => void;
  className?: string;
}

export function WidgetChat({
  config,
  conversationId,
  apiBaseUrl,
  onClose,
  className,
}: WidgetChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const pendingMessageIds = useRef<Set<string>>(new Set());
  
  const conversationIdRef = useRef(conversationId);
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const { messages, addMessage, setMessages } = useConversationStore();

  const handleAddMessage = useCallback((message: Message) => {
    const messageId = message.id !== undefined && message.id !== null 
      ? String(message.id) 
      : undefined;
    
    if (!messageId || messageId.startsWith('temp-')) {
      const exists = messages.some(m => String(m.id) === messageId);
      if (!exists) {
        addMessage(message);
      }
      return;
    }

    const existingIndex = messages.findIndex(m => String(m.id) === messageId);
    const tempIndex = messages.findIndex(m => {
      const mid = String(m.id);
      return mid === `temp-${messageId}` || mid === `temp-${message.text?.substring(0, 20)}`;
    });
    
    if (existingIndex === -1 && tempIndex === -1) {
      addMessage(message);
    } else if (existingIndex === -1 && tempIndex !== -1) {
      const updatedMessages = [...messages];
      updatedMessages[tempIndex] = { ...message, id: messageId };
      setMessages(updatedMessages);
    }
  }, [messages, addMessage, setMessages]);

  const { isConnected, isConnecting, sendMessage } = useSocket({
    apiBaseUrl,
    conversationId,
    token: typeof window !== 'undefined' ? localStorage.getItem('customerToken') || '' : '',
    onMessage: (message: Message) => {
      console.log('💬 پیام جدید از Socket:', message);
      
      const messageId = message.id !== undefined && message.id !== null 
        ? String(message.id) 
        : undefined;
      
      if (messageId && pendingMessageIds.current.has(messageId)) {
        pendingMessageIds.current.delete(messageId);
      }
      
      handleAddMessage(message);
    },
    onConnect: () => {
      console.log('✅ Connected to chat');
    },
    onDisconnect: () => {
      console.log('🔌 Disconnected from chat');
    },
    onError: (error) => {
      console.error('Socket error:', error);
    },
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const isImage = file.type.startsWith('image/');
    const folder = isImage ? 'chat-images' : 'chat-files';
    formData.append('folder', folder);

    if (isImage) {
      formData.append('width', '800');
      formData.append('height', '800');
    }

    try {
      const customerToken = localStorage.getItem('customerToken');
      const contextToken = localStorage.getItem('contextToken');
      
      const headers: Record<string, string> = {};
      
      if (customerToken) {
        headers['Authorization'] = `Bearer ${customerToken}`;
      }
      
      if (contextToken) {
        headers['x-context-token'] = contextToken;
      }

      console.log('📤 آپلود فایل با customerToken:', {
        hasToken: !!customerToken,
        hasContext: !!contextToken,
        fileName: file.name,
        fileSize: file.size,
      });

      const response = await fetch(`${apiBaseUrl}/upload/file`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`خطا در آپلود فایل: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ فایل با موفقیت آپلود شد:', result);
      
      return result.filePath || result.fullPath || result.path;
    } catch (error) {
      console.error('❌ خطا در آپلود فایل:', error);
      throw error;
    }
  };

  // ✅ ارسال پیام با فایل (اصلاح شده با ترکیب متن کاربر)
  const handleSendWithFile = async () => {
    if (!selectedFile || isSending || isUploading) return;

    setIsUploading(true);
    setIsSending(true);

    try {
      // 1. آپلود فایل
      const filePath = await uploadFile(selectedFile);

      // 2. ساخت محتوای فایل
      const isImage = selectedFile.type.startsWith('image/');
      let fileContent = '';
      
      if (isImage) {
        fileContent = `![${selectedFile.name}](${filePath})`;
      } else {
        const fileName = selectedFile.name;
        const fileSize = (selectedFile.size / 1024).toFixed(1);
        fileContent = `📎 **${fileName}** (${fileSize} KB)\n${filePath}`;
      }

      // ✅ 3. ترکیب متن کاربر و محتوای فایل
      const userText = newMessage.trim();
      let messageText = '';
      
      if (userText) {
        messageText = `${userText}\n\n${fileContent}`;
      } else {
        messageText = fileContent;
      }

      // 4. تولید ID یکتا برای پیام
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      pendingMessageIds.current.add(tempId);

      // 5. اضافه کردن پیام به لیست محلی
      const newMsg: Message = {
        id: tempId,
        text: messageText,
        sender: 'customer',
        timestamp: new Date(),
        isInternal: false,
        fileUrl: filePath,
        fileType: isImage ? 'image' : 'document',
        fileName: selectedFile.name,
      };
      
      addMessage(newMsg);

      // 6. ارسال پیام از طریق Socket
      sendMessage(messageText);

      // 7. پاک کردن فایل انتخاب شده و متن پیام
      setSelectedFile(null);
      setFilePreview(null);
      setNewMessage('');

    } catch (error) {
      console.error('❌ خطا در ارسال فایل:', error);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        text: '❌ خطا در ارسال فایل. لطفاً دوباره تلاش کنید.',
        sender: 'customer',
        timestamp: new Date(),
        isInternal: false,
      };
      addMessage(errorMsg);
    } finally {
      setIsUploading(false);
      setIsSending(false);
    }
  };

  // ✅ ارسال پیام متنی
  const handleSendMessage = async () => {
    // اگر فایل انتخاب شده باشد، از متد ارسال با فایل استفاده کن
    if (selectedFile) {
      await handleSendWithFile();
      return;
    }

    const text = newMessage.trim();
    if (!text || !isConnected || isSending) return;

    setIsSending(true);
    setNewMessage('');

    try {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      pendingMessageIds.current.add(tempId);

      const newMsg: Message = {
        id: tempId,
        text: text,
        sender: 'customer',
        timestamp: new Date(),
        isInternal: false,
      };
      addMessage(newMsg);
      sendMessage(text);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('حجم فایل نباید بیشتر از ۱۰ مگابایت باشد');
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    e.target.value = '';
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderMessageContent = (msg: Message) => {
    const text = msg.text || '';
    
    const imageMatch = text.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (imageMatch) {
      const [, alt, url] = imageMatch;
      const fullUrl = url.startsWith('http') ? url : `${apiBaseUrl}${url}`;
      return (
        <div className="space-y-2">
          <img
            src={fullUrl}
            alt={alt || 'تصویر'}
            className="max-w-[250px] max-h-[250px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onError={(e) => {
              console.error('❌ خطا در بارگذاری تصویر:', fullUrl);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
            onClick={() => window.open(fullUrl, '_blank')}
          />
          {text.replace(imageMatch[0], '').trim() && (
            <p className="whitespace-pre-wrap text-sm">
              {text.replace(imageMatch[0], '').trim()}
            </p>
          )}
        </div>
      );
    }

    const fileMatch = text.match(/📎 \*\*([^*]+)\*\* \(([^)]+)\)\n([^\n]+)/);
    if (fileMatch) {
      const [, fileName, fileSize, fileUrl] = fileMatch;
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${apiBaseUrl}${fileUrl}`;
      return (
        <div className="space-y-2">
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] hover:border-[#59D8C3] transition-colors text-[#59D8C3]"
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">{fileName}</span>
            <span className="text-xs text-gray-400">({fileSize} KB)</span>
          </a>
          {text.replace(fileMatch[0], '').trim() && (
            <p className="whitespace-pre-wrap text-sm">
              {text.replace(fileMatch[0], '').trim()}
            </p>
          )}
        </div>
      );
    }

    const oldFileMatch = text.match(/📎 ([^\n]+)\n([^\n]+)/);
    if (oldFileMatch) {
      const [, fileName, fileUrl] = oldFileMatch;
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${apiBaseUrl}${fileUrl}`;
      return (
        <div className="space-y-2">
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] hover:border-[#59D8C3] transition-colors text-[#59D8C3]"
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">{fileName}</span>
          </a>
          {text.replace(oldFileMatch[0], '').trim() && (
            <p className="whitespace-pre-wrap text-sm">
              {text.replace(oldFileMatch[0], '').trim()}
            </p>
          )}
        </div>
      );
    }

    return <p className="whitespace-pre-wrap text-sm">{text}</p>;
  };

  const primaryColor = config.primaryColor || '#14b8a6';
  const companyName = config.companyName || 'پشتیبان‌یار';

  return (
    <motion.div
      className={cn(
        'widget-chat-container flex flex-col overflow-hidden',
        className
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.25 }}
    >
      <div 
        className="widget-chat-header flex items-center justify-between px-5 py-4"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base truncate leading-tight">
              {companyName}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-xs text-white/80">
                {isConnecting ? 'در حال اتصال...' : isConnected ? 'آنلاین' : 'آفلاین'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/15 rounded-lg transition-colors flex-shrink-0 text-white/80 hover:text-white"
          aria-label="بستن"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="widget-chat-messages flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">هنوز پیامی ارسال نشده</p>
            <p className="text-gray-400 text-xs mt-1">اولین پیام را شما ارسال کنید</p>
          </div>
        ) : (
          Array.from(
            new Map(messages.map(msg => [String(msg.id), msg])).values()
          ).map((msg, index) => {
            const isCustomer = msg.sender === 'customer';
            
            return (
              <div
                key={String(msg.id) || index}
                className={cn(
                  'flex items-end ',
                  isCustomer ? 'flex-row' : 'flex-row-reverse'
                )}
              >
                <div className={cn(
                  'flex flex-col max-w-[85%]',
                  isCustomer ? 'items-end' : 'items-start'
                )}>
                  {!isCustomer && (
                    <span className="text-[10px] text-gray-400 mb-1 mr-1">
                      {msg.senderName || 'پشتیبانی'}
                    </span>
                  )}
                  
                  <div
                    className={cn(
                      'px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words',
                      isCustomer
                        ? 'text-white rounded-br-sm' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    )}
                    style={isCustomer ? { backgroundColor: primaryColor } : {}}
                  >
                    {renderMessageContent(msg)}
                  </div>
                  
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="widget-chat-input border-t border-gray-200 bg-white px-4 py-3">
        {selectedFile && (
          <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
            {filePreview ? (
              <img
                src={filePreview}
                alt="preview"
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={removeSelectedFile}
              disabled={isUploading}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedFile ? "توضیح (اختیاری)..." : "پیام خود را بنویسید..."}
              disabled={!isConnected || isConnecting || isUploading}
              rows={1}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50 border border-gray-200 focus:outline-none focus:border-transparent resize-none min-h-[44px] max-h-[120px] transition-all"
              style={{ 
                paddingRight: '3rem',
                borderColor: isConnected ? primaryColor + '40' : '#e5e7eb',
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && !selectedFile) || !isConnected || isSending || isUploading}
              className="absolute right-1 bottom-3  w-9 h-9 rounded-3xl flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <div className="mb-3">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!isConnected || isConnecting || isSending || isUploading}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="ارسال فایل یا عکس"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
        </div>
      </div>
    </motion.div>
  );
}