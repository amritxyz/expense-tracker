/* src/components/Login.jsx (Updated) */
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import "./index.css";

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
        setTimeout(() => navigate('/dashboard'), 1500); // Redirect after success
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
      <div className="from-black to-gray-800 bg-gradient-to-t h-screen">
        {/* <section className="from-black to-gray-800 bg-gradient-to-t h-screen max-w-lvw mx-auto flex justify-center items-center"> */}
        < div id="centering_this_div" >
          <div className="w-[100%] h-[100%] m-10 p-6 bg-gray-100 shadow-md rounded-2xl flex-col">
            <p className="px-1 my-4"> LOGO </p>
            <h2 className="text-[#303030] text-2xl font-semibold mb-6 ">Log in<br />
              <span className="font-[500] text-[15px] text-gray-500">
                Continue to Expense Tracker
              </span>
            </h2>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
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
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                      />

                      <ErrorMessage
                        name={field.name}
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition duration-200 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </button>
                </Form>
              )}
            </Formik>

            <p className="flex items-center justify-center my-3">
              Don't have an account?
              <Link to="/signup" className="mx-1 text-blue-500 hover:underline hover:text-blue-800">
                Sign up
              </Link>
            </p>
            <ToastContainer />
          </div>
        </div >
        {/* </section> */}
      </div>
    </>
  );
};
