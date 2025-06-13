import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PainelLayout = ({ children }) => {
  return (
    <div className="h-screen max-w-screen-2xl mx-auto">
      <main className="w-full min-h-[calc(100vh-80px)] p-0.5 overflow-y-auto">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          className="text-xl"
          theme="colored"
        />
        <div>{children}</div>
      </main>
    </div>
  );
};

export default PainelLayout;
