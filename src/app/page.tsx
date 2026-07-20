import SinglePromptChat from '@/components/SinglePromptChat';
import MultiTurnChat from '@/components/MultiTurnChat';
import StreamingChat from '@/components/StreamingChat';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center gap-12 px-8 py-16">
        <StreamingChat />
        <MultiTurnChat />
        <SinglePromptChat />
      </main>
    </div>
  );
}
