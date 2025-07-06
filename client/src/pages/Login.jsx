import { useForm } from "react-hook-form";
import { useState, useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

const Login = () => {
  const navigate = useNavigate();

  const { setIsLoggedIn, getUserData, tokenSetter } = useContext(AppContext);

  const [state, setState] = useState("Sign Up");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();


  const onSubmit = async (formData) => {
  const { fullName, email, password } = formData;


  try {
    const url =
      state === "Sign Up"
        ? `auth/register`
        : `auth/login`;

    // Prepare payload based on form state
    const payload =
      state === "Sign Up"
        ? { name: fullName, email, password }
        : { email, password };

    const response = await axiosInstance.post(url, payload);
    const responseData = response.data;

    if (responseData.success) {
      toast.success(responseData.message || "Authenticated successfully");
      tokenSetter(responseData.token);
      setIsLoggedIn(true);
      await getUserData();
      navigate("/");
    } else {
      toast.error(responseData.message || "Something went wrong");
    }
  } catch (error) {
    const errMsg =
      error.response?.data?.message || "Internal Server Error. Try again.";
    toast.error(errMsg);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      <div className="w-full max-w-md bg-slate-900 p-10 sm:p-10 rounded-lg shadow-lg sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-bold mb-4 text-center">
          {state === "Sign Up" ? "Create Account" : "Log In"}
        </h2>
        <p className="text-center mb-4">
          {state === "Sign Up"
            ? "Create Your Account"
            : "Login To Your Account"}
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Full Name */}
          {state === "Sign Up" && (
            
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.person_icon} alt="" />
            <input
              type="text"
              placeholder="Full Name"
              {...register("fullName", { required: "Full Name is required" })}
              className="text-white bg-transparent border-none outline-none flex-1"
            />
          </div>
            
          )}
          {errors.fullName && (
            <p className="text-red-400 px-5 -mt-3 mb-2">
              {errors.fullName.message}
            </p>
          )}
          

          {/* Email */}
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" />
            <input
              type="email"
              placeholder="Email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
              className="text-white bg-transparent border-none outline-none flex-1"
            />
          </div>
          {errors.email && (
            <p className="text-red-400 px-5 -mt-3 mb-2">
              {errors.email.message}
            </p>
          )}

          {/* Password */}
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" />
            <input
              type="password"
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="text-white bg-transparent border-none outline-none flex-1"
            />
          </div>
          {errors.password && (
            <p className="text-red-400 px-5 -mt-3 mb-2">
              {errors.password.message}
            </p>
          )}

          {/* Forgot Password */}
          <p className="text-right mb-2 text-sm text-gray-400 hover:underline cursor-pointer">
            Forgot Password?
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-gradient-to-br from-blue-500 to-indigo-900 text-white py-2 px-4 rounded-full w-full"
          >
            {state}
          </button>
        </form>

        {state === "Sign Up" ? (
          <p className="text-gray-400 text-left text-sm mt-4">
            Already have an account?{" "}
            <span
              className="text-indigo-300 hover:underline cursor-pointer"
              onClick={() => setState("Log In")}
            >
              Log In
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-left text-sm mt-4">
            Don't have an account?{" "}
            <span
              className="text-indigo-300 hover:underline cursor-pointer"
              onClick={() => setState("Sign Up")}
            >
              Sign Up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
