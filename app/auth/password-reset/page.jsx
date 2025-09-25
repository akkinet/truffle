"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Reset = () => {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [cPassword, setCPassword] = useState("")
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()

  const pageTitle = 'Password Reset';

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  const submitHandler = async e => {
    try {
      e.preventDefault()
      if (password == '' || cPassword == '') {
        toast.error('fields are empty')
        return
      } else if (password !== cPassword) {
        toast.error("passwords ain't matching")
        return
      }

      setLoading(true) // start spinner

      await fetch(`/api/auth/resetpassword`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password })
      })

      router.push("/verify/passwordreset")
    } catch (err) {
      console.log("err", err)
    } finally {
      setLoading(false) // stop spinner
    }
  }


  return (
    <div
     className="flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center "
      style={{ backgroundImage: "url('https://s3.ap-south-1.amazonaws.com/jkare.data/banner+image.jpg')" }}
    >
      <ToastContainer />
      {/* Background image for mobiles */}
      <div
        className="lg:hidden absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://s3.ap-south-1.amazonaws.com/jkare.data/banner+image.jpg')" }}
      ></div>
      <div className="relative p-8 rounded-lg max-w-md w-full z-10 border-2 shadow-2xl bg-black/20 backdrop-blur-md object-center">
        <h2 className="text-4xl font-bold mb-6 text-center text-white">
          Reset Password
        </h2>
        <form className="w-full space-y-4" onSubmit={submitHandler}>
          <div className="flex flex-col mb-4">
            <label className="text-white text-sm font-bold" htmlFor="new-password">
              New Password
            </label>
            <div className="relative">
              <input
                className="shadow appearance-none border rounded py-2 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={({ target }) => setPassword(target.value)}
                placeholder="Enter your New Password"
              />
              <span
                className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="flex flex-col mb-4">
            <label className="text-white text-sm font-bold" htmlFor="confirm-password">
              Confirm Password
            </label>
            <div className="relative">
              <input
                className="shadow appearance-none border rounded py-2 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
                id="confirm-password"
                type={showCPassword ? "text" : "password"}
                value={cPassword}
                onChange={({ target }) => setCPassword(target.value)}
                placeholder="Confirm your New Password"
              />
              <span
                className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
                onClick={() => setShowCPassword(!showCPassword)}
              >
                {showCPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="bg-customBlue shadow-inner text-white hover:bg-customBaseBlue hover:text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>

          </div>
        </form>
        <div className="flex items-center justify-center mt-6">
          <Link className="inline-block align-baseline font-bold text-sm text-white hover:text-gray-400" href="/login">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Reset
