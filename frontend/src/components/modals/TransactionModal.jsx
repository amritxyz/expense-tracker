// /src/components/modals/TransactionModal.jsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  modalType, // 'add' | 'edit'
  transactionType, // 'income' | 'expense'
  title // Optional override
}) {
  if (!isOpen) return null;

  // Dynamic validation schema
  const validationSchema = Yup.object().shape({
    amount: Yup.number()
      .required('Amount is required')
      .positive('Amount must be positive')
      .integer('Amount must be an integer'),
    date: Yup.date()
      .max(new Date().toISOString().split('T')[0], 'Date cannot be in the future')
      .required('Date is required'),
    ...(transactionType === 'income'
      ? {
        inc_source: Yup.string()
          .matches(/[a-zA-Z]/, 'Income source must include at least one letter')
          .required('Income source is required'),
      }
      : {
        categories: Yup.string().required('Category is required'),
        description: Yup.string()
          .matches(/[a-zA-Z]/, 'Description must include at least one letter')
          .max(25, 'Max 25 characters')
          .required('Description is required'),
      }),
  });

  // Auto-generate title if not provided
  const getTitle = () => {
    if (title) return title;
    const action = modalType === 'edit' ? 'Edit' : 'Add';
    const type = transactionType === 'income' ? 'Income' : 'Expense';
    return `${action} ${type}`;
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-4xl cursor-pointer"
          >
            &times;
          </button>
        </div>
        <hr className="my-3 border-gray-300" />

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              {/* Amount */}
              <div className="mb-5">
                <label className="block text-lg font-medium text-gray-700">
                  Amount<span className="text-red-500">*</span>
                </label>
                <Field
                  name="amount"
                  type="mb-5"
                  placeholder="Enter amount"
                  className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
                <ErrorMessage name="amount" component="div" className="text-red-500 text-sm mt-1" />
              </div>


              {/* Conditional Fields */}
              {transactionType === 'income' ? (
                // Income Source
                <div className="mb-5">
                  <label className="block text-lg font-medium text-gray-700">
                    Income Source<span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="inc_source"
                    type="text"
                    placeholder="e.g., Salary, Freelancing"
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                  <ErrorMessage name="inc_source" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              ) : (
                // Expense Category + Description
                <>
                  <div className="mb-5">
                    <label className="block text-lg font-medium text-gray-700">
                      Category<span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="categories"
                      as="select"
                      className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">Select...</option>
                      <option value="Food">Food</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Rent">Rent</option>
                      <option value="Others">Others</option>
                    </Field>
                    <ErrorMessage name="categories" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div className="mb-5">
                    <label className="block text-lg font-medium text-gray-700">
                      Description<span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="description"
                      type="text"
                      placeholder="e.g., Groceries"
                      className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    />
                    <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </>
              )}

              {/* Date */}
              <div className="mb-5">
                <label className="block text-lg font-medium text-gray-700">
                  Date<span className="text-red-500">*</span>
                </label>
                <Field
                  name="date"
                  type="date"
                  className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
                <ErrorMessage name="date" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 cursor-pointer border border-gray-300 shadow-sm"
                >
                  Cancel
                </button>
                {transactionType == "expense" ? (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 cursor-pointer shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                  >
                    {modalType === 'edit' ? 'Save Changes' : 'Add'}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 cursor-pointer shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                  >
                    {modalType === 'edit' ? 'Save Changes' : 'Add'}
                  </button>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
