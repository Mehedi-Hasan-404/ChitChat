// components/chat/ChatHeader.tsx

'use client';

import { useChat } from '@/lib/hooks/useChat';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { FormEvent, useState } from 'react';

const ProfileEditor = ({ onClose }: { onClose: () => void }) => {
    const { user, saveUserProfile } = useChat();
    const [name, setName] = useState(user?.name || '');
    const [picUrl, setPicUrl] = useState(user?.pic || '');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            saveUserProfile(name.trim(), picUrl.trim());
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
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
                Save Changes
            </button>
        </form>
    );
};


export const ChatHeader = () => {
    const { user, onlineUsers, status } = useChat();
    const [isProfileOpen, setProfileOpen] = useState(false);
    
    const onlineCount = onlineUsers.length;
    let onlineStatusText = 'Connecting...';
    if(status === 'connected') {
        onlineStatusText = `${onlineCount} user${onlineCount !== 1 ? 's' : ''} online`;
    } else if (status === 'error') {
        onlineStatusText = 'Connection Failed';
    }

    const ProfileAvatar = () => (
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-text-dark dark:text-dark-text-dark bg-amber-400 shadow-light border-2 border-white cursor-pointer transition-transform hover:scale-105"
             style={{ backgroundImage: `url(${user?.pic})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            {!user?.pic && (user?.name?.charAt(0) || 'U').toUpperCase()}
        </div>
    );

    return (
        <header className="flex-shrink-0 flex items-center p-3 sm:p-4 border-b border-border-color dark:border-dark-border-color bg-bg-main dark:bg-dark-bg-main shadow-sm">
            <Dialog open={isProfileOpen} onOpenChange={setProfileOpen}>
                <DialogTrigger asChild>
                    <button><ProfileAvatar /></button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Your Profile</DialogTitle>
                    </DialogHeader>
                    <ProfileEditor onClose={() => setProfileOpen(false)} />
                </DialogContent>
            </Dialog>

            <div className="flex-grow mx-3 overflow-hidden">
                <h2 className="text-lg font-semibold truncate text-text-dark dark:text-dark-text-dark">ChatKat by Mehedi</h2>
                <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">{onlineStatusText}</p>
            </div>
            <ThemeToggle />
        </header>
    );
};
