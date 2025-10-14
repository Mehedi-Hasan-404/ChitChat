// app/page.tsx

'use client';

import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { useChat } from '@/lib/hooks/useChat';
import { FormEvent, useState } from 'react';

const ProfileCreationDialog = () => {
    const { saveUserProfile } = useChat();
    const [name, setName] = useState('');
    const [picUrl, setPicUrl] = useState('');
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            saveUserProfile(name.trim(), picUrl.trim());
        } else {
            alert('Please enter a display name.');
        }
    };
    
    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Create Your Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div>
                        <label htmlFor="name-input" className="block mb-2 font-medium text-text-dark dark:text-dark-text-dark">Display Name</label>
                        <input
                            id="name-input"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Alex Doe"
                            required
                            className="w-full p-3 border border-border-color dark:border-dark-border-color rounded-medium bg-bg-light dark:bg-dark-bg-light focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="profile-pic-url" className="block mb-2 font-medium text-text-dark dark:text-dark-text-dark">Profile Picture URL (Optional)</label>
                        <input
                            id="profile-pic-url"
                            type="text"
                            value={picUrl}
                            onChange={(e) => setPicUrl(e.target.value)}
                            placeholder="Paste image URL here"
                            className="w-full p-3 border border-border-color dark:border-dark-border-color rounded-medium bg-bg-light dark:bg-dark-bg-light focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary outline-none"
                        />
                    </div>
                    <button type="submit" className="w-full py-3 text-white font-semibold rounded-medium bg-primary hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover transition-all shadow-light hover:shadow-medium hover:-translate-y-0.5">
                        Save and Join Chat
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default function ChatPage() {
    const { user } = useChat();

    // The profile dialog is shown if the user object doesn't exist
    if (!user) {
        return <ProfileCreationDialog />;
    }

    return (
        <main className="flex justify-center items-center h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900">
            <div className="flex flex-col w-full h-full max-w-md bg-bg-main dark:bg-dark-bg-main shadow-heavy sm:h-[95vh] sm:max-h-[900px] sm:rounded-3xl overflow-hidden">
                <ChatHeader />
                <ChatMessages />
                <TypingIndicator />
                <ChatInput />
            </div>
        </main>
    );
}
