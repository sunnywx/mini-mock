export default function Layout({ children }) {
  return (
    <main>
      <div className='flex max-w-6xl max-h-screen pt-[30px] mx-auto px-5 bg-white '>
        <div className='mx-auto w-full'>{children}</div>
      </div>
    </main>
  );
}
