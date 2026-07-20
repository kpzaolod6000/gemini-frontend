import SinglePromptChat from '@/components/SinglePromptChat';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center px-8 py-16">
        <SinglePromptChat />
      </main>
    </div>
  );
}
