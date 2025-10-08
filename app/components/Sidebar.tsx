"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChatMessage } from "../types";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  currentChatId: string | null;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export default function Sidebar({ 
  isOpen, 
  onToggle, 
  onNewChat, 
  onSelectChat, 
  currentChatId 
}: SidebarProps) {
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 从本地存储加载聊天历史
  useEffect(() => {
    const saved = localStorage.getItem('joeyllm-chat-histories');
    if (saved) {
      try {
        const histories = JSON.parse(saved).map((h: any) => ({
          ...h,
          createdAt: new Date(h.createdAt),
          updatedAt: new Date(h.updatedAt)
        }));
        setChatHistories(histories);
      } catch (error) {
        console.error('Failed to load chat histories:', error);
      }
    }
  }, []);

  // 保存聊天历史到本地存储
  const saveChatHistories = (histories: ChatHistory[]) => {
    localStorage.setItem('joeyllm-chat-histories', JSON.stringify(histories));
    setChatHistories(histories);
  };

  // 删除聊天记录
  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = chatHistories.filter(h => h.id !== chatId);
    saveChatHistories(updated);
    if (currentChatId === chatId) {
      onNewChat();
    }
  };

  // 生成聊天标题
  const generateChatTitle = (messages: ChatMessage[]): string => {
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
    }
    return 'New Chat';
  };

  // 更新当前聊天
  const updateCurrentChat = (messages: ChatMessage[]) => {
    if (!currentChatId) return;
    
    const updated = chatHistories.map(h => 
      h.id === currentChatId 
        ? { 
            ...h, 
            messages, 
            title: generateChatTitle(messages),
            updatedAt: new Date()
          }
        : h
    );
    saveChatHistories(updated);
  };

  // 创建新聊天
  const handleNewChat = () => {
    const newChat: ChatHistory = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [{ role: 'assistant', content: 'Hello! I am Joey LLM assistant, how can I help you?' }],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const updated = [newChat, ...chatHistories];
    saveChatHistories(updated);
    onSelectChat(newChat.id);
    onNewChat();
  };

  return (
    <>
      {/* 移动端遮罩 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* 侧边栏 */}
      <div className={`
        fixed top-0 left-0 h-full bg-white/90 dark:bg-black/90 backdrop-blur-xl border-r border-gray-300/20 dark:border-cyan-400/20 z-50
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-16' : 'w-80'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* 侧边栏头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-300/20 dark:border-cyan-400/20">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src="/kangaroo.png"
                  alt="JoeyLLM Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-blue-600 dark:text-cyan-400">JoeyLLM</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">AI Assistant</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            {isCollapsed && (
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src="/kangaroo.png"
                  alt="JoeyLLM Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg border border-gray-300/30 dark:border-cyan-400/30 bg-gray-100/10 dark:bg-cyan-500/10 text-gray-700 dark:text-cyan-300 hover:bg-gray-200/20 dark:hover:bg-cyan-500/20 transition-colors"
            >
              <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={onToggle}
              className="p-2 rounded-lg border border-gray-300/30 dark:border-cyan-400/30 bg-gray-100/10 dark:bg-cyan-500/10 text-gray-700 dark:text-cyan-300 hover:bg-gray-200/20 dark:hover:bg-cyan-500/20 transition-colors lg:hidden"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 新建对话按钮 */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-cyan-500/20 dark:to-purple-500/20 border border-blue-400/30 dark:border-cyan-400/30 text-blue-700 dark:text-cyan-300 hover:from-blue-500/30 hover:to-purple-500/30 dark:hover:from-cyan-500/30 dark:hover:to-purple-500/30 transition-all duration-300 hover-lift"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {!isCollapsed && <span className="font-medium">New Chat</span>}
          </button>
        </div>

        {/* 聊天历史列表 */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Recent Chats</h3>
              {chatHistories.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-cyan-500/10 dark:to-purple-500/10 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-500 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No conversations yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Start a new chat to begin</p>
                </div>
              ) : (
                chatHistories.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={`
                      group relative p-3 rounded-lg cursor-pointer transition-all duration-200
                      ${currentChatId === chat.id 
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-cyan-500/20 dark:to-purple-500/20 border border-blue-400/30 dark:border-cyan-400/30' 
                        : 'bg-gray-100/30 dark:bg-gray-800/30 border border-gray-300/30 dark:border-gray-700/30 hover:bg-gray-200/40 dark:hover:bg-gray-700/40 hover:border-blue-400/20 dark:hover:border-cyan-400/20'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {chat.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {chat.messages.length} messages
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {chat.updatedAt.toLocaleDateString()}
                        </p>
                      </div>
                      
                      <button
                        onClick={(e) => deleteChat(chat.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 侧边栏底部 */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-300/20 dark:border-cyan-400/20">
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200/40 dark:hover:bg-gray-700/40 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">Settings</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200/40 dark:hover:bg-gray-700/40 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Help & FAQ</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
