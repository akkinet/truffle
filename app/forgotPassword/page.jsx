"use client"
import { useEffect, useState } from "react"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSpinner } from "react-icons/fa";
import HeadingImage from "@/public/Heading.png";

const Forgot = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const pageTitle = 'Password Forget';
  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const submitHandler = async e => {
    try {
      e.preventDefault()
      if (!email.trim()) {
        toast.error("Please enter a valid registered email");
        return;
      }

      if (!validateEmail(email)) {
        toast.error("Please enter a valid registered email");
        return;
      }
      setLoading(true)   // start loader
      const res = await fetch(`/api/auth/forgetpassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      })
      const data = await res.text()
      if (data == "User not found!") {
        toast.error("No Such User exist")
        setLoading(false)
        return
      }

      toast.success(data);
      setEmail("");
    } catch (err) {
      alert("alert", err)
    } finally {
      setLoading(false)   // always stop loader
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden relative">
      {/* Blurred background */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-md"
        style={{ backgroundImage: `url(${HeadingImage.src})` }}
      ></div>
      
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40 z-5"></div>

      {/* Logo with dark background for better visibility */}
      <div className="absolute top-6 left-6 z-20 lg:top-8 lg:left-8 lg:block hidden">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <img
            src="/Logo.svg"
            alt="JKare Logo"
            className="h-12 w-auto"
          />
        </div>
      </div>

      <ToastContainer />

      {/* Background image for mobiles */}
      <div
        className="lg:hidden absolute inset-0 z-0 bg-cover bg-center blur-md"
        style={{ backgroundImage: `url(${HeadingImage.src})` }}
      ></div>

      <div className="relative p-8 mx-4 rounded-2xl max-w-md w-full z-10  border border-white/30 shadow-2xl bg-white/5 backdrop-blur-2xl">
        <h2 className="text-4xl font-bold mb-6 text-center text-white">
          Forgot Password
        </h2>
        <form className="w-full space-y-4" onSubmit={submitHandler}>
          <div className="flex flex-col mb-4">
            <label className="text-white text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className={`shadow-sm appearance-none border-2 rounded-lg py-3 px-4 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                email && !validateEmail(email) 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              id="email"
              type="email"
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              placeholder="Enter your registered email"
            />
            {email && !validateEmail(email) && (
              <p className="text-red-600 text-sm mt-1">Please enter a valid email address</p>
            )}
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !email || !validateEmail(email)}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-red-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg w-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2 " />
                  Sending Reset Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </div>
        </form>
        
        <div className="flex items-center justify-center mt-6">
          <a
            className="inline-block align-baseline font-semibold text-sm text-white hover:text-gray-400 transition-colors duration-200"
            href="/"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}

export default Forgot