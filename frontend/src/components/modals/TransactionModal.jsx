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

  // 💡 Dynamic validation schema
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

  // 🎯 Auto-generate title if not provided
  const getTitle = () => {
    if (title) return title;
    const action = modalType === 'edit' ? 'Edit' : 'Add';
    const type = transactionType === 'income' ? 'Income' : 'Expense';
    return `${action} ${type}`;
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl cursor-pointer"
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
              {/* 💰 Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Amount<span className="text-red-500">*</span>
                </label>
                <Field
                  name="amount"
                  type="number"
                  placeholder="Enter amount"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
                <ErrorMessage name="amount" component="div" className="text-red-500 text-sm mt-1" />
              </div>


              {/* Conditional Fields */}
              {transactionType === 'income' ? (
                // 💼 Income Source
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Income Source<span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="inc_source"
                    type="text"
                    placeholder="e.g., Salary, Freelancing"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                  <ErrorMessage name="inc_source" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              ) : (
                // 🏷️ Expense Category + Description
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Category<span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="categories"
                      as="select"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
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

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Description<span className="text-red-500">*</span>
                    </label>
                    <Field
                      name="description"
                      type="text"
                      placeholder="e.g., Groceries"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    />
                    <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </>
              )}

              {/* 📅 Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Date<span className="text-red-500">*</span>
                </label>
                <Field
                  name="date"
                  type="date"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
                <ErrorMessage name="date" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
                >
                  {modalType === 'edit' ? 'Save Changes' : 'Add'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
