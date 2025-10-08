"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import ThemeToggle from "./components/ThemeToggle";
import { ChatMessage, ChatHistory } from "./types";

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hello! I am Joey LLM assistant, how can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // 保存聊天历史到本地存储
  const saveChatHistory = (chatId: string, messages: ChatMessage[]) => {
    const saved = localStorage.getItem('joeyllm-chat-histories');
    let histories: ChatHistory[] = saved ? JSON.parse(saved) : [];
    
    const existingIndex = histories.findIndex(h => h.id === chatId);
    const chatData: ChatHistory = {
      id: chatId,
      title: generateChatTitle(messages),
      messages,
      createdAt: existingIndex >= 0 ? new Date(histories[existingIndex].createdAt) : new Date(),
      updatedAt: new Date()
    };

    if (existingIndex >= 0) {
      histories[existingIndex] = chatData;
    } else {
      histories.unshift(chatData);
    }

    localStorage.setItem('joeyllm-chat-histories', JSON.stringify(histories));
  };

  // 生成聊天标题
  const generateChatTitle = (messages: ChatMessage[]): string => {
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
    }
    return 'New Chat';
  };

  // 加载聊天历史
  const loadChatHistory = (chatId: string) => {
    const saved = localStorage.getItem('joeyllm-chat-histories');
    if (saved) {
      const histories: ChatHistory[] = JSON.parse(saved);
      const chat = histories.find(h => h.id === chatId);
      if (chat) {
        setMessages(chat.messages);
        setCurrentChatId(chatId);
      }
    }
  };

  // 新建聊天
  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    setMessages([{ role: "assistant", content: "Hello! I am Joey LLM assistant, how can I help you?" }]);
    setCurrentChatId(newChatId);
    setSidebarOpen(false);
  };

  // 选择聊天
  const handleSelectChat = (chatId: string) => {
    loadChatHistory(chatId);
    setSidebarOpen(false);
  };

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    // 如果没有当前聊天ID，创建一个新的
    if (!currentChatId) {
      const newChatId = Date.now().toString();
      setCurrentChatId(newChatId);
    }

    const userMsg: ChatMessage = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // 保存用户消息到历史记录
    if (currentChatId) {
      saveChatHistory(currentChatId, newMessages);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.content || "Sorry, I cannot process your request.",
      };
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      
      // 保存完整对话到历史记录
      if (currentChatId) {
        saveChatHistory(currentChatId, finalMessages);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = { role: "assistant", content: `⚠️ Error: ${err.message}` };
      const finalMessages = [...newMessages, errorMsg];
      setMessages(finalMessages);
      
      // 保存错误消息到历史记录
      if (currentChatId) {
        saveChatHistory(currentChatId, finalMessages);
      }
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([
      { role: "assistant", content: "Hello! I am Joey LLM assistant, how can I help you?" },
    ]);
    setCurrentChatId(null);
  }

  return (
    <div className="flex h-screen bg-white dark:bg-black">
      {/* 侧边栏 */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId}
      />

      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* 科技感背景装饰 */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* 移动端顶部栏 */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-300/20 dark:border-cyan-400/20 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg border border-gray-300/30 dark:border-cyan-400/30 bg-gray-100/10 dark:bg-cyan-500/10 text-gray-700 dark:text-cyan-300 hover:bg-gray-200/20 dark:hover:bg-cyan-500/20 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-cyan-300">JOEYLLM CHAT</h1>
          <ThemeToggle />
        </div>

        {/* 聊天内容区域 */}
        <div className="flex-1 flex flex-col p-4 lg:p-6 space-y-6 overflow-hidden">

          {/* 科技感标题区域 - 仅在桌面端显示 */}
          <div className="hidden lg:flex relative flex-col items-center space-y-4">
            <div className="relative">
              <Image
                src="/title_pic.png"
                alt="JoeyLLM Logo"
                width={600}
                height={180}
                priority
                className="h-24 w-auto md:h-28 lg:h-32 object-contain drop-shadow-2xl hover-lift"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 dark:from-cyan-400/20 dark:via-purple-400/20 dark:to-pink-400/20 rounded-lg blur-sm -z-10"></div>
            </div>
            
            {/* 桌面端主题切换按钮 */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>


          {/* 科技感聊天窗口 */}
          <div className="gradient-border p-1 flex-1 flex flex-col">
            <div className="rounded-xl bg-white/30 dark:bg-black/30 backdrop-blur-sm p-3 lg:p-4 flex-1 flex flex-col">
              <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`group relative max-w-[92%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all duration-300 hover-lift ${
                  m.role === "assistant"
                    ? "bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-gray-800/80 dark:to-gray-700/80 text-gray-800 dark:text-gray-100 border border-gray-300/30 dark:border-gray-600/30"
                    : "ml-auto bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-cyan-500/20 dark:to-purple-500/20 text-blue-900 dark:text-cyan-100 border border-blue-400/30 dark:border-cyan-400/30"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    m.role === "assistant" 
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 dark:from-cyan-500 dark:to-purple-500 text-white" 
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  }`}>
                    {m.role === "assistant" ? "J" : "U"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`font-semibold text-xs tracking-wider ${
                        m.role === "assistant" ? "text-blue-600 dark:text-cyan-400" : "text-pink-600 dark:text-pink-400"
                      }`}>
                        {m.role === "assistant" ? "JOEY AI" : "USER"}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${
                        m.role === "assistant" ? "bg-blue-400 dark:bg-cyan-400" : "bg-pink-400"
                      } pulse-glow`}></div>
                    </div>
                    <div className="text-gray-700 dark:text-gray-200">{m.content}</div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="max-w-[92%] rounded-2xl bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-gray-800/80 dark:to-gray-700/80 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 border border-gray-300/30 dark:border-gray-600/30">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 dark:from-cyan-500 dark:to-purple-500 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-xs tracking-wider text-blue-600 dark:text-cyan-400">JOEY AI</span>
                      <div className="w-2 h-2 bg-blue-400 dark:bg-cyan-400 rounded-full pulse-glow"></div>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                      <span>Processing</span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-blue-400 dark:bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-blue-400 dark:bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-1 h-1 bg-blue-400 dark:bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

              {/* 科技感输入区域 */}
              <form onSubmit={sendMessage} className="mt-4 flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    className="w-full min-h-[50px] resize-none rounded-xl border border-blue-400/30 dark:border-cyan-400/30 bg-white/40 dark:bg-black/40 p-3 lg:p-4 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 dark:focus:ring-cyan-400/50 focus:border-blue-400/50 dark:focus:border-cyan-400/50 transition-all duration-300"
                    rows={2}
                    placeholder="Enter your message to Joey AI..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-cyan-500/5 dark:to-purple-500/5 pointer-events-none"></div>
                </div>
                <button
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 dark:from-cyan-500 dark:to-purple-500 px-4 lg:px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-400 hover:to-purple-400 dark:hover:from-cyan-400 dark:hover:to-purple-400 hover:shadow-blue-500/25 dark:hover:shadow-cyan-500/25 hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading || !input.trim()}
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">SENDING</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span className="hidden sm:inline">SEND</span>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 dark:from-cyan-400 dark:to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
