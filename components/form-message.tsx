"use client";

type Message = {
  type: 'error' | 'success';
  content: string;
};

export function FormMessage({ message }: { message: Message }) {
  const colorClass = message.type === 'error' 
    ? 'text-red-500' 
    : 'text-green-500';

  return (
    <div className={`text-center ${colorClass}`}>
      {message.content}
    </div>
  );
}
