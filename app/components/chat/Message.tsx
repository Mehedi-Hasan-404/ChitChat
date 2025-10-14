// components/chat/Message.tsx

import { Message as MessageType, UserProfile } from '@/lib/types';
import { format } from 'date-fns';

interface MessageProps {
  message: MessageType;
  currentUser: UserProfile;
}

export const Message = ({ message, currentUser }: MessageProps) => {
  const isSent = message.sessionId === currentUser.sessionId;
  const time = format(new Date(message.timestamp), 'HH:mm');

  const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  const imageRegex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;

  const renderContent = () => {
    if (imageRegex.test(message.text)) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={message.text} alt="User content" className="max-w-full rounded-medium mt-1.5 cursor-pointer" onClick={() => window.open(message.text, '_blank')} />;
    }
    const parts = message.text.split(urlPattern);
    return parts.map((part, index) => 
        urlPattern.test(part) 
            ? <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="underline">{part}</a> 
            : <span key={index}>{part}</span>
    );
  };

  return (
    <div className={`flex flex-col mb-3 animate-fadeInUp ${isSent ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-end max-w-[85%] ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
            {!isSent && (
                <div className="w-8 h-8 rounded-full flex-shrink-0 mr-2 flex items-center justify-center text-sm font-medium bg-gray-300 shadow-light"
                     style={{ backgroundImage: `url(${message.sender.pic})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                    {!message.sender.pic && (message.sender.name?.charAt(0) || '?').toUpperCase()}
                </div>
            )}
            <div className={`px-4 py-3 rounded-large shadow-light ${isSent ? 'bg-sent-bg text-text-light dark:bg-dark-sent-bg dark:text-dark-text-light rounded-br-small' : 'bg-received-bg text-text-dark dark:bg-dark-received-bg dark:text-dark-text-dark rounded-bl-small'}`}>
                {!isSent && <div className="text-sm font-semibold text-primary dark:text-dark-primary mb-1">{message.sender.name || 'Anonymous'}</div>}
                <div className="text-base break-words">
                    {renderContent()}
                </div>
                <div className="text-xs opacity-80 mt-1.5 float-right ml-2">{time}</div>
            </div>
        </div>
    </div>
  );
};
