
import { useNavigate } from "react-router-dom";
import { useForm, useController } from "react-hook-form";
import { assets } from "../assets/assets";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";

const EmailVerify = () => {
  
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    setFocus,
    setValue,
  } = useForm({
    defaultValues: {
      otp: Array(6).fill(""),
    },
  });

  // Custom controller for each digit

const DigitInput = ({ index }) => {
  const {
    field: { value, onChange, ref },
  } = useController({
    name: `otp[${index}]`,
    control,
    rules: { required: true, pattern: /^[0-9]$/ },
  });

  const handleChange = (e) => {
    const inputVal = e.target.value.replace(/[^0-9]/g, ""); // Only allow digits
    if (inputVal) {
      onChange(inputVal.charAt(inputVal.length - 1)); // Only latest digit
      if (index < 5) {
        setTimeout(() => setFocus(`otp[${index + 1}]`), 10);
      }
    } else {
      onChange("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace") {
      if (value === "" && index > 0) {
        setTimeout(() => {
          setFocus(`otp[${index - 1}]`);
        }, 10);
      } else {
        onChange("");
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    [...pasted].forEach((digit, i) => {
      setValue(`otp[${i}]`, digit);
    });
    setTimeout(() => setFocus(`otp[${Math.min(pasted.length, 5)}]`), 10);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      maxLength={1}
      value={value || ""}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      className="mx-1 w-12 h-12 bg-[#333A5C] text-white text-center text-lg rounded-sm outline-none"
      ref={ref}
    />
  );
};



  const onSubmitHandler = async (formData) => {
    const otpDigits = formData.otp.join("");
    try {
      const { data } = await axiosInstance.post(`auth/verify-email`, {
        otpDigits,
      });
      if (data.success) {
        toast.success(data.message || "Authenticated successfully");
        navigate("/");
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message || "Server error while sending OTP";
      toast.error(errMsg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      <div className="w-auto max-w-md bg-slate-900 p-10 sm:p-10 rounded-lg shadow-lg sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-bold mb-4 text-center">Verify Your Email</h2>
        <p className="text-center mb-4">Enter the 6 digit code sent to your email</p>

        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <div className="flex justify-center mb-4">
            {[...Array(6)].map((_, index) => (
              <DigitInput key={index} index={index} />
            ))}
          </div>

          <button
            type="submit"
            className="mt-2 bg-gradient-to-br from-blue-500 to-indigo-900 text-white font-medium py-2 px-4 rounded-full w-full cursor-pointer"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailVerify;
