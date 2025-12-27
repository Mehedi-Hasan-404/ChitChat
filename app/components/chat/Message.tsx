
// components/chat/Message.tsx

'use client';

import { Message as MessageType, UserProfile } from '@/lib/types';
import { format } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { sanitizeUrl, sanitizeImageUrl, sanitizeCssUrl } from '@/lib/security/sanitize';

interface MessageProps {
  message: MessageType;
  currentUser: UserProfile;
  onReply: (message: MessageType) => void;
}

export const Message = ({ message, currentUser, onReply }: MessageProps) => {
  const isSent = message.sessionId === currentUser.sessionId;
  const time = format(new Date(message.timestamp), 'HH:mm');
  
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Strict URL pattern - only http/https
  const urlPattern = /\b(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/gi;
  
  // Strict image URL validation
  const isImageUrl = (url: string): boolean => {
    const sanitized = sanitizeImageUrl(url);
    return sanitized !== '' && sanitized === url;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    
    // Only allow swiping in the correct direction
    if (isSent && diff < 0) {
      setSwipeOffset(Math.max(diff, -80));
    } else if (!isSent && diff > 0) {
      setSwipeOffset(Math.min(diff, 80));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const threshold = 60;
    
    if (Math.abs(swipeOffset) > threshold) {
      onReply(message);
    }
    
    setSwipeOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    setIsDragging(true);
  };

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const diff = e.clientX - startX.current;
        if (isSent && diff < 0) {
          setSwipeOffset(Math.max(diff, -80));
        } else if (!isSent && diff > 0) {
          setSwipeOffset(Math.min(diff, 80));
        }
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);
        const threshold = 60;
        if (Math.abs(swipeOffset) > threshold) {
          onReply(message);
        }
        setSwipeOffset(0);
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, swipeOffset, isSent, message, onReply]);

  const renderContent = () => {
    const text = message.text || '';
    
    // Check if the entire message is an image URL
    if (isImageUrl(text)) {
      const sanitizedUrl = sanitizeImageUrl(text);
      if (sanitizedUrl) {
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={sanitizedUrl} 
            alt="User shared image" 
            className="max-w-full rounded-medium mt-1.5 cursor-pointer" 
            onClick={() => {
              const safe = sanitizeUrl(text);
              if (safe) window.open(safe, '_blank', 'noopener,noreferrer');
            }}
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        );
      }
    }
    
    // Split text by URLs and render
    const parts = text.split(urlPattern);
    const matches = text.match(urlPattern) || [];
    
    const result: JSX.Element[] = [];
    let matchIndex = 0;
    
    parts.forEach((part, index) => {
      if (part) {
        // Add text part (escaped)
        result.push(
          <span key={`text-${index}`}>{part}</span>
        );
      }
      
      // Add URL part if exists
      if (matchIndex < matches.length) {
        const url = matches[matchIndex];
        const sanitized = sanitizeUrl(url);
        
        if (sanitized) {
          result.push(
            <a 
              key={`link-${index}`}
              href={sanitized}
              target="_blank" 
              rel="noopener noreferrer"
              className="underline break-all"
              onClick={(e) => {
                // Additional safety check on click
                e.preventDefault();
                const safe = sanitizeUrl(url);
                if (safe) {
                  window.open(safe, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              {url}
            </a>
          );
        } else {
          // If URL is not safe, render as plain text
          result.push(
            <span key={`unsafe-${index}`} className="text-red-500">[Invalid URL]</span>
          );
        }
        matchIndex++;
      }
    });
    
    return result.length > 0 ? result : <span>{text}</span>;
  };

  // Sanitize profile picture URL
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

  return (
    <div className={`flex flex-col mb-3 animate-fadeInUp ${isSent ? 'items-end' : 'items-start'}`}>
        <div 
          ref={containerRef}
          className={`relative flex items-end max-w-[85%] touch-pan-y select-none ${isSent ? 'flex-row-reverse' : 'flex-row'}`}
          style={{ 
            transform: `translateX(${swipeOffset}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
            {/* Reply Icon */}
            <div 
              className={`absolute top-1/2 -translate-y-1/2 transition-opacity ${
                Math.abs(swipeOffset) > 30 ? 'opacity-100' : 'opacity-0'
              } ${isSent ? 'right-full mr-2' : 'left-full ml-2'}`}
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 dark:bg-dark-primary/20 flex items-center justify-center">
                <Image 
                  src="/icons/reply.svg" 
                  alt="Reply" 
                  width={16} 
                  height={16}
                  className="text-primary dark:text-dark-primary"
                />
              </div>
            </div>

            {!isSent && (
                <div 
                  className="w-8 h-8 rounded-full flex-shrink-0 mr-2 flex items-center justify-center text-sm font-medium bg-gray-300 shadow-light"
                  style={getProfilePicStyle(message.sender.pic)}
                >
                    {!message.sender.pic && (message.sender.name?.charAt(0) || '?').toUpperCase()}
                </div>
            )}
            <div className={`relative px-4 py-3 rounded-large shadow-light ${isSent ? 'bg-sent-bg text-text-light dark:bg-dark-sent-bg dark:text-dark-text-light rounded-br-small' : 'bg-received-bg text-text-dark dark:bg-dark-received-bg dark:text-dark-text-dark rounded-bl-small'}`}>
                {/* Reply preview */}
                {message.replyTo && (
                  <div className={`mb-2 pb-2 border-l-4 pl-2 text-xs opacity-70 ${isSent ? 'border-white' : 'border-primary dark:border-dark-primary'}`}>
                    <div className="font-semibold">
                      {message.replyTo.sender.name || 'Unknown'}
                    </div>
                    <div className="truncate max-w-[250px]">
                      {message.replyTo.text || ''}
                    </div>
                  </div>
                )}
                
                {!isSent && (
                  <div className="text-sm font-semibold text-primary dark:text-dark-primary mb-1">
                    {message.sender.name || 'Anonymous'}
                  </div>
                )}
                <div className="text-base break-words">
                    {renderContent()}
                </div>
                <div className="text-xs opacity-80 mt-1.5 float-right ml-2">{time}</div>
                
                {/* Reply button for desktop/long press */}
                <button
                  onClick={() => onReply(message)}
                  className="absolute -top-2 right-2 w-7 h-7 rounded-full bg-bg-main dark:bg-dark-bg-main shadow-medium flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  aria-label="Reply to message"
                >
                  <Image src="/icons/reply.svg" alt="Reply" width={14} height={14} />
                </button>
            </div>
        </div>
    </div>
  );
};
