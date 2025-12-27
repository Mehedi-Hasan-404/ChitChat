// components/chat/ChatHeader.tsx

'use client';

import { useChat } from '@/lib/hooks/useChat';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { FormEvent, useState, useEffect } from 'react';
import { sanitizeProfilePicUrl, sanitizeName, sanitizeCssUrl } from '@/lib/security/sanitize';

const ProfileEditor = ({ onClose }: { onClose: () => void }) => {
    const { user, saveUserProfile } = useChat();
    const [name, setName] = useState(user?.name || '');
    const [picUrl, setPicUrl] = useState(user?.pic || '');
    const [error, setError] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');
        
        const sanitizedName = sanitizeName(name);
        
        if (!sanitizedName) {
            setError('Please enter a valid display name');
            return;
        }
        
        const sanitizedPic = picUrl.trim() ? sanitizeProfilePicUrl(picUrl.trim()) : '';
        
        if (picUrl.trim() && !sanitizedPic) {
            setError('Invalid profile picture URL. Please use a valid http/https image URL.');
            return;
        }
        
        saveUserProfile(sanitizedName, sanitizedPic);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-medium text-red-700 dark:text-red-300 text-sm">
                    {error}
                </div>
            )}
            <div>
                <label htmlFor="name-input" className="block mb-2 font-medium text-text-dark dark:text-dark-text-dark">
                    Display Name
                </label>
                <input
                    id="name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Alex Doe"
                    required
                    maxLength={50}
                    className="w-full p-3 border border-border-color dark:border-dark-border-color rounded-medium bg-bg-light dark:bg-dark-bg-light focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary outline-none text-text-dark dark:text-dark-text-dark"
                />
            </div>
            <div>
                <label htmlFor="profile-pic-url" className="block mb-2 font-medium text-text-dark dark:text-dark-text-dark">
                    Profile Picture URL (Optional)
                </label>
                <input
                    id="profile-pic-url"
                    type="url"
                    value={picUrl}
                    onChange={(e) => setPicUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    maxLength={500}
                    className="w-full p-3 border border-border-color dark:border-dark-border-color rounded-medium bg-bg-light dark:bg-dark-bg-light focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary outline-none text-text-dark dark:text-dark-text-dark"
                />
            </div>
            <button 
                type="submit" 
                className="w-full py-3 text-white font-semibold rounded-medium bg-primary hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover transition-all shadow-light hover:shadow-medium hover:-translate-y-0.5"
            >
                Save Changes
            </button>
        </form>
    );
};

export const ChatHeader = () => {
    const { user, onlineUsers, status } = useChat();
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [showDebug, setShowDebug] = useState(false);
    
    const onlineCount = onlineUsers.length;
    let onlineStatusText = 'Connecting...';
    let statusColor = 'text-yellow-500';
    
    if(status === 'connected') {
        onlineStatusText = `${onlineCount} user${onlineCount !== 1 ? 's' : ''} online`;
        statusColor = 'text-green-500';
    } else if (status === 'error') {
        onlineStatusText = 'Connection Failed';
        statusColor = 'text-red-500';
    }

    // Show debug info if connection fails
    useEffect(() => {
        if (status === 'error') {
            console.error('❌ Connection Error - Check console for details');
            setShowDebug(true);
        }
    }, [status]);

    const getProfilePicStyle = (picUrl: string | undefined) => {
        if (!picUrl) return {};
        const sanitized = sanitizeCssUrl(picUrl);
        if (!sanitized) return {};
        
        return {
            backgroundImage: `url('${sanitized}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        };
    };

    const ProfileAvatar = () => (
        <div 
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white bg-gradient-to-br from-amber-400 to-orange-500 shadow-light border-2 border-white dark:border-gray-700 cursor-pointer transition-transform hover:scale-105"
            style={getProfilePicStyle(user?.pic)}
        >
            {!user?.pic && (user?.name?.charAt(0) || 'U').toUpperCase()}
        </div>
    );

    return (
        <>
            <header className="flex-shrink-0 flex items-center p-3 sm:p-4 border-b border-border-color dark:border-dark-border-color bg-bg-main dark:bg-dark-bg-main shadow-sm">
                <Dialog open={isProfileOpen} onOpenChange={setProfileOpen}>
                    <DialogTrigger asChild>
                        <button aria-label="Edit profile">
                            <ProfileAvatar />
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Your Profile</DialogTitle>
                        </DialogHeader>
                        <ProfileEditor onClose={() => setProfileOpen(false)} />
                    </DialogContent>
                </Dialog>

                <div className="flex-grow mx-3 overflow-hidden">
                    <h2 className="text-lg font-semibold truncate text-text-dark dark:text-dark-text-dark">
                        ChatKat by Mehedi
                    </h2>
                    <p className={`text-sm font-medium ${statusColor}`}>
                        {onlineStatusText}
                        {status === 'error' && (
                            <button 
                                onClick={() => window.location.reload()}
                                className="ml-2 text-xs underline text-primary dark:text-dark-primary"
                            >
                                Retry
                            </button>
                        )}
                    </p>
                </div>
                <ThemeToggle />
            </header>
            
            {/* Debug Info Banner */}
            {showDebug && status === 'error' && (
                <div className="bg-red-100 dark:bg-red-900/30 border-b border-red-300 dark:border-red-700 p-3 text-sm">
                    <p className="text-red-800 dark:text-red-300 font-semibold mb-1">
                        🔴 Connection Error
                    </p>
                    <p className="text-red-700 dark:text-red-400 text-xs mb-2">
                        Check browser console (F12) for details, or verify your environment variables are set correctly.
                    </p>
                    <button 
                        onClick={() => setShowDebug(false)}
                        className="text-xs text-red-600 dark:text-red-400 underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}
        </>
    );
};
