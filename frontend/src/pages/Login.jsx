// src/components/Login.jsx
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import "./login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  const onSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        toast.success("Login successful!");
        setTimeout(() => navigate('/dashboard'), 1500); // Automatically redirect after success
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error logging in: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-blue-50 h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
          {/* Logo Section */}
          <div className="flex gap-1.5 items-center justify-center my-5">
            <div className='rounded-full h-8 w-8 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500'>
              <span className='text-white font-bold text-sm'>ExT</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              ExpenseTracker
            </span>
          </div>

          {/* Login Header */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Log in</h2>
          <p className="text-gray-600 text-sm mb-6 text-center">Continue to Expense Tracker</p>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                {/* Email Field */}
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Password Field */}
                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <Field
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center mb-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-gradient-to-l focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {isSubmitting ? "Logging in..." : "Log In"}
                  </button>
                </div>

                <p className="text-sm text-center">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-blue-500 hover:text-blue-700">Register here</Link>
                </p>
              </Form>
            )}
          </Formik>

          {/* Toast notifications */}
          <ToastContainer />
        </div>
      </div>
    </>
  );
}
