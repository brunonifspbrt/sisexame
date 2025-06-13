import Link from "next/link";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TerminalLayout({ children }) {
  return (
    <div className="h-screen w-full bg-gray-400 overflow-hidden">
      <header className="bg-gray-800 dark:bg-gray-900"></header>

      <main className="w-full max-w-screen-lg mx-auto bg-gray-400 p-4 overflow-auto">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          className="text-lg"
          theme="colored"
        />
        <div className="mx-1 my-1">{children}</div>
      </main>
    </div>
  );
}
