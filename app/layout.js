import "@/app/globals.css";
import Footer from "./components/Footer";
import AuthProvider from "./components/AuthProvider";
import Navbar from "./components/Navbar";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlobalProvider } from "./context/GlobalContext";
export const metadata = {
  title: "Property pulse",
   keywords: 'rental, property, real estate',
  description: 'Find The Perfect Rental Property',
};

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
    <GlobalProvider>
    <html lang="en">
      <body>
        <Navbar/>
        {children}
        <Footer/>
        <ToastContainer/>
      </body>
    </html>
    </GlobalProvider>
    </AuthProvider>
  );
}
