/* src/components/Signup.jsx (Updated) */
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const initialValues = {
    user: "",
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    user: Yup.string()
      .required("Full Name is required")
      .min(4, "Full Name must be at least 4 characters")
      .max(40, "Full Name cannot exceed 40 characters"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  const onSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await register(values.user, values.email, values.password);

      if (result.success) {
        toast.success("Registration successful!");
        setTimeout(() => navigate('/login'), 1500); // Redirect to login
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error registering user: " + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="from-black to-gray-800 bg-gradient-to-t h-screen max-w-lvw mx-auto flex justify-center items-center">
      <div className="w-[25%] h-[43%] m-10 p-6 bg-gray-100 shadow-md rounded-2xl">
        <h2 className="text-2xl text-[#303030] font-semibold mb-6 text-center">SignUp</h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              {[
                {
                  name: 'user',
                  label: 'Full Name',
                  type: 'text',
                  placeholder: 'Enter your full name',
                },
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

                  {field.type === 'textarea' ? (
                    <Field
                      as="textarea"
                      id={field.name}
                      name={field.name}
                      rows="3"
                      placeholder={field.placeholder}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                    />
                  ) : (
                    <Field
                      type={field.type}
                      id={field.name}
                      name={field.name}
                      placeholder={field.placeholder}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
                    />
                  )}

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
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </Form>
          )}
        </Formik>

        <p className="flex items-center justify-center my-3">
          already have one?
          <Link to="/login" className="mx-1 text-blue-500 hover:underline hover:text-blue-800">
            Login
          </Link>
        </p>
        <ToastContainer />
      </div>
    </section>
  );
};

export default Signup;
