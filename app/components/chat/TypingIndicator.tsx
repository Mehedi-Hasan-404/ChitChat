// components/chat/TypingIndicator.tsx

'use client';

import { useChat } from '@/lib/hooks/useChat';

export const TypingIndicator = () => {
    const { typingUsers } = useChat();

    let text = '';
    if (typingUsers.length === 1) {
        text = `${typingUsers[0].name} is typing...`;
    } else if (typingUsers.length > 1) {
        text = `${typingUsers.length} people are typing...`;
    }

    return (
        <div className="px-4 h-7 text-sm italic text-text-secondary dark:text-dark-text-secondary transition-all">
            {text}
        </div>
    );
};
