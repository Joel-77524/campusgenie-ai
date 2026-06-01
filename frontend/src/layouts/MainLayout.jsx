import Navbar from '../components/Navbar';
import ChatWidget from '../components/ChatWidget';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen animated-gradient">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #2563eb, transparent)' }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }}
        />
      </div>

      <Navbar />
      <main className="relative z-10">{children}</main>
      <ChatWidget />
    </div>
  );
};

export default MainLayout;
