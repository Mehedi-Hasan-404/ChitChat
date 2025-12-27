// components/chat/ChatInput.tsx

'use client';

import { useChat } from '@/lib/hooks/useChat';
import Image from 'next/image';
import { useState, useRef, ChangeEvent } from 'react';

export const ChatInput = () => {
    const [text, setText] = useState('');
    const { sendMessage, setTyping, uploadAndSendMessage, replyingTo, setReplyingTo } = useChat();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadError, setUploadError] = useState('');

    const handleSend = () => {
        const trimmed = text.trim();
        if (trimmed) {
            // Limit message length
            if (trimmed.length > 5000) {
                setUploadError('Message is too long. Maximum 5000 characters.');
                return;
            }
            sendMessage(trimmed);
            setText('');
            setUploadError('');
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        } else {
            setTyping(true);
        }
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setUploadError('Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setUploadError('File is too large. Maximum size is 5MB.');
            return;
        }

        setUploadError('');
        
        try {
            await uploadAndSendMessage(file);
        } catch (error) {
            setUploadError('Failed to upload image. Please try again.');
        }
        
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const cancelReply = () => {
        setReplyingTo(null);
    };

    return (
        <div className="flex-shrink-0 bg-bg-main dark:bg-dark-bg-main border-t border-border-color dark:border-dark-border-color">
            {/* Error Message */}
            {uploadError && (
                <div className="px-4 pt-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-medium text-red-700 dark:text-red-300 text-sm">
                        {uploadError}
                        <button
                            onClick={() => setUploadError('')}
                            className="ml-2 underline"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
            
            {/* Reply Preview */}
            {replyingTo && (
                <div className="px-4 pt-3 pb-2 border-b border-border-color dark:border-dark-border-color">
                    <div className="flex items-start bg-bg-light dark:bg-dark-bg-light rounded-medium p-3">
                        <div className="flex-grow border-l-4 border-primary dark:border-dark-primary pl-3">
                            <div className="text-xs font-semibold text-primary dark:text-dark-primary mb-1">
                                Replying to {replyingTo.sender.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-text-secondary dark:text-dark-text-secondary truncate">
                                {replyingTo.text || ''}
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
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full text-text-secondary hover:text-text-dark dark:text-dark-text-secondary dark:hover:text-dark-text-dark transition-colors"
                        aria-label="Attach image"
                        title="Upload image (Max 5MB)"
                    >
                        <Image src="/icons/attachment.svg" alt="Attach" width={20} height={20} />
                    </button>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
                        maxLength={5000}
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
                <div className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2 text-center">
                    {text.length}/5000 characters
                </div>
            </div>
        </div>
    );
};
