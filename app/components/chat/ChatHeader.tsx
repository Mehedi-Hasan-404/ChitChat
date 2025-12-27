// app/components/chat/ChatHeader.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useChat } from '../providers/ChatProvider';
import { LogOut, Settings, X } from 'lucide-react';

export function ChatHeader() {
    const { signOut } = useAuth();
    const [showSettings, setShowSettings] = useState(false);
    const { user, saveUserProfile } = useChat();
    const [name, setName] = useState(user?.name || '');
    const [picUrl, setPicUrl] = useState(user?.avatarUrl || '');
    const [error, setError] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        saveUserProfile({
            name: name.trim(),
            avatarUrl: picUrl.trim() || undefined
        });

        setShowSettings(false);
        setError('');
    };

    return (
        <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {user?.avatarUrl ? (
                        <img 
                            src={user.avatarUrl} 
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    )}
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">ChitChat</h1>
                        <p className="text-sm text-gray-500">{user?.name || 'Anonymous'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Settings"
                    >
                        <Settings className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                        onClick={signOut}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Sign out"
                    >
                        <LogOut className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Profile Settings</h2>
                            <button
                                onClick={() => {
                                    setShowSettings(false);
                                    setError('');
                                    setName(user?.name || '');
                                    setPicUrl(user?.avatarUrl || '');
                                }}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Avatar URL (optional)
                                </label>
                                <input
                                    type="url"
                                    value={picUrl}
                                    onChange={(e) => setPicUrl(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://example.com/avatar.jpg"
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSettings(false);
                                        setError('');
                                        setName(user?.name || '');
                                        setPicUrl(user?.avatarUrl || '');
                                    }}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
