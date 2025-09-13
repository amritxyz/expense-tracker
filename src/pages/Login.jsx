import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const Login = () => {
  // Define initial values
  const initialValues = {
    email: "",
    password: "",
  };

  // Validation schema using Yup
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),

    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  // Handle submit with onSubmit
  const onSubmit = async (values) => {
    try {
      // POST request to login the user
      const response = await axios.post("http://localhost:5000/login", {
        email: values.email,
        password: values.password,
      });

      // If successful, show success message and maybe redirect
      toast.success("Login successful!");
    } catch (error) {
      // Show error message
      toast.error("Error logging in: " + error.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto m-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-semibold mb-6 text-center">Login Form</h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form>
          {/* Define Fields */}
          {[
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              placeholder: 'Enter your email',
            },
            {
              name: 'password',
              label: 'Password',
              type: 'password',
              placeholder: 'Enter your password',
            },
          ].map((field) => (
            <div key={field.name} className="mb-4">
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                {field.label}
              </label>

              <Field
                type={field.type}
                id={field.name}
                name={field.name}
                placeholder={field.placeholder}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />

              <ErrorMessage
                name={field.name}
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
          ))}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </Form>
      </Formik>
      <p className="flex items-center justify-center my-3">
        Don't have an account?
        <Link to="/signup" className="mx-1 text-blue-500 hover:underline duration-300">
          Sign up
        </Link>
      </p>
      <ToastContainer />
    </div>
  );
};

export default Login;
