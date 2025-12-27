// components/chat/ChatInput.tsx

'use client';

import { useChat } from '@/lib/hooks/useChat';
import Image from 'next/image';
import { useState, useRef, ChangeEvent } from 'react';

export const ChatInput = () => {
    const [text, setText] = useState('');
    const { sendMessage, setTyping, uploadAndSendMessage, replyingTo, setReplyingTo } = useChat();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (text.trim()) {
            sendMessage(text);
            setText('');
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        } else {
            setTyping(true);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadAndSendMessage(file);
        }
    };

    const cancelReply = () => {
        setReplyingTo(null);
    };

    return (
        <div className="flex-shrink-0 bg-bg-main dark:bg-dark-bg-main border-t border-border-color dark:border-dark-border-color">
            {/* Reply Preview */}
            {replyingTo && (
                <div className="px-4 pt-3 pb-2 border-b border-border-color dark:border-dark-border-color">
                    <div className="flex items-start bg-bg-light dark:bg-dark-bg-light rounded-medium p-3">
                        <div className="flex-grow border-l-4 border-primary dark:border-dark-primary pl-3">
                            <div className="text-xs font-semibold text-primary dark:text-dark-primary mb-1">
                                Replying to {replyingTo.sender.name}
                            </div>
                            <div className="text-sm text-text-secondary dark:text-dark-text-secondary truncate">
                                {replyingTo.text}
                            </div>
                        </div>
                        <button
                            onClick={cancelReply}
                            className="ml-2 p-1 rounded-full hover:bg-bg-main dark:hover:bg-dark-bg-main transition-colors"
                            aria-label="Cancel reply"
                        >
                            <Image src="/icons/close.svg" alt="Cancel" width={16} height={16} />
                        </button>
                    </div>
                </div>
            )}
            
            {/* Input Area */}
            <div className="p-4">
                <div className="flex items-center p-2 rounded-full bg-bg-light dark:bg-dark-bg-light shadow-light ring-primary dark:ring-dark-primary focus-within:ring-2 transition-all">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full text-text-secondary hover:text-text-dark dark:text-dark-text-secondary dark:hover:text-dark-text-dark transition-colors"
                        aria-label="Attach file"
                    >
                        <Image src="/icons/attachment.svg" alt="Attach" width={20} height={20} />
                    </button>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
                        className="flex-grow bg-transparent outline-none px-3 text-base text-text-dark dark:text-dark-text-dark placeholder-text-secondary dark:placeholder-dark-text-secondary"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!text.trim()}
                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-white transition-all enabled:hover:scale-105 enabled:hover:bg-primary-hover disabled:bg-text-secondary disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                        <Image src="/icons/send.svg" alt="Send" width={20} height={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
