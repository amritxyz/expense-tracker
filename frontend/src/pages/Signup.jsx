/* src/components/Signup.jsx (Updated) */
import { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import "./login.css";

const Signup = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Redirect to dashboard if already logged in
      navigate('/dashboard');
    }
  }, [navigate]);

  const initialValues = {
    user: "",
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    user: Yup.string()
      .required("Full Name is required")
      .min(4, "Full Name must be at least 4 characters")
      .max(25, "Full Name cannot exceed 25 characters")
      .matches(/^[A-Za-z\s]+$/, "Please don't include any special characters"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required")
      .test(
        'no-only-numbers',
        'Email cannot contain only numbers',
        value => {
          // Get the part before the @ symbol
          const emailWithoutDomain = value.split('@')[0];
          // Must contain at least one letter in the part before @
          return /[a-zA-Z]/.test(emailWithoutDomain);
        }
      )
      .test(
        'no-special-symbols',
        'Email cannot contain special characters other than "@"',
        value => {
          // Allow only letters, numbers, dots, hyphens, and underscores in the local part of the email
          const localPart = value.split('@')[0];
          return /^[a-zA-Z0-9._-]+$/.test(localPart);
        }
      )
      .test(
        'single-at-symbol',
        'Email should contain exactly one "@" symbol',
        value => {
          // Ensure there is only one @ symbol in the email
          const atSymbolCount = (value.match(/@/g) || []).length;
          return atSymbolCount === 1;
        }
      ),

    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  const onSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);

    try {
      const result_register = await register(values.user, values.email, values.password);

      if (!result_register.success) {
        toast.error(result_register.message);
        if (result_register.message === "User already exists. Please log in.") {
          setTimeout(() => navigate('/login'), 2000); // Redirect to login after showing error
        }
        return;
      }

      const result_login = await login(values.email, values.password);

      if (result_login.success) {
        toast.loading("Registering...");

        setTimeout(() => {
          toast.success("Registration successful!");
          toast.loading("Logging in...");
        }, 400);

        setTimeout(() => {
          toast.success("Login successful!");
          navigate('/dashboard');
        }, 1200);
      } else {
        toast.error("Login failed after registration.");
      }
    } catch (error) {
      toast.error(`Error: ${error.message || "An unexpected error occurred."}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-blue-50 h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
          {/* Logo Section */}
          <Link className="flex gap-1.5 items-center my-5">
            <div className='rounded-full h-8 w-8 flex items-center justify-center
             bg-linear-to-r from-blue-500 to-purple-500'>
              <span className='text-white font-bold text-sm'>ExT</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-500 to-purple-500">
              ExpenseTracker
            </span>
          </Link>

          {/* Signup Header */}
          <h2 className="text-2xl font-bold text-gray-800 ">Sign Up</h2>
          <p className="text-gray-600 text-sm mb-6 ">Create an account to get started</p>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                {/* Full Name Field */}
                <div className="mb-4">
                  <label htmlFor="user" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <Field
                    type="text"
                    id="user"
                    name="user"
                    placeholder="Enter your full name"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage
                    name="user"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

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

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:from-blue-600 hover:to-blue-700 transition duration-300"
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </button>
              </Form>
            )}
          </Formik>

          {/* Login Link */}
          <p className="text-center text-sm mt-4 text-gray-600">
            Already have an account?
            <Link to="/login" className="text-blue-500 hover:text-blue-700"> Login</Link>
          </p>

          {/* Toast Notifications */}
          <ToastContainer />
        </div>
      </div>
    </>
  );
};

export default Signup;
