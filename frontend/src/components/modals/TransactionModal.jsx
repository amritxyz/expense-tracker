// /src/components/modals/TransactionModal.jsx
import React, { useRef, useState, useEffect } from 'react';
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
      }),
  });

  // Auto-generate title if not provided
  const getTitle = () => {
    if (title) return title;
    const action = modalType === 'edit' ? 'Edit' : 'Add';
    const type = transactionType === 'income' ? 'Income' : 'Expense';
    return `${action} ${type}`;
  };

  // Categories
  const [isOpenCategories, setIsOpenCategories] = useState(false); // Fixed: should be boolean
  const [selectedValue, setSelectedValue] = useState(initialValues.categories || ""); // Set initial value
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Main categories
  const mainCategories = [
    "Food & Dining",
    "Transportation",
    "Housing",
    "Entertainment",
    "Shopping",
    "Health & Wellness",
    "Personal Care",
    "Education",
    "Travel",
    "Business",
    "Others"
  ];

  // Subcategories mapping
  const subcategories = {
    "Food & Dining": [
      "Bar", "Groceries", "Cafe", "Restaurants, fast-food", "Dining out"
    ],
    "Housing": [
      "Rent", "Mortgage", "Utilities", "Home insurance", "Maintenance, repairs", "Property tax"
    ],
    "Transportation": [
      "Business trips", "Long distance", "Public transport", "Taxi"
    ],
    "Vehicle": [
      "Fuel", "Leasing", "Parking", "Rentals", "Vehicle insurance", "Vehicle maintenance"
    ],
    "Entertainment": [
      "Sports", "Alcohol, tobacco", "Books, audio, subscriptions", "Movies", "Concerts, events", "Subscriptions", "Gaming", "Hobbies", "TV, streaming", "Life events"
    ],
    "Shopping": [
      "Clothes & shoes", "Drug-store", "Electronics, accessories", "Health & Beauty", "Jewelry", "Stationery, tools", "Household Items", "Gifts, joy", "Pets", "Kids"
    ],
    "Communication, PC": [
      "Internet", "Phone, cell phone", "Postal services", "Software, apps, games"
    ],
    "Health & Wellness": [
      "Medical", "Prescriptions", "Gym", "Health insurance", "Dental", "Vision"
    ],
    "Personal Care": [
      "Hair Care", "Skincare", "Toiletries", "Personal hygiene"
    ],
    "Education": [
      "Tuition", "Books/supplies", "Online courses", "Tutoring"
    ],
    "Travel": [
      "Flights", "Hotels", "Car rental", "Travel insurance", "Sightseeing"
    ],
    "Investments": [
      "Collections", "Financial investments", "Realty", "Savings", "Vehicles, chattels"
    ],
    "Business": [
      "Office supplies", "Business meals", "Professional services", "Marketing"
    ]
  };

  // Function to handle category selection
  // Function to handle category selection
  const handleCategorySelect = (value, setFieldValue) => {
    setSelectedValue(value);  // Set the selected category (main category)
    setFieldValue('categories', value);  // Set the selected category in Formik
    setIsOpenCategories(false);  // Close the category dropdown
    setSearchTerm('');  // Clear the search term
  };

  // Function to handle subcategory selection
  const handleSubcategorySelect = (subcategories, setFieldValue) => {
    setFieldValue('categories', subcategories);  // Set the selected subcategory in Formik
    setIsOpenCategories(false);  // Close the dropdown
    setSearchTerm('');  // Clear the search term
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpenCategories(false);
        setSearchTerm(''); // Clear search when closing
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (values) => {
    if (transactionType == "expense") {
      const dataToSend = {
        amount: values.amount,
        categories: selectedValue,  // Main category or subcategory selected
        subcategories: values.categories,  // Send the actual subcategory (or category if no subcategory)
        date: values.date,
      };
      onSubmit(dataToSend);
    } else {
      const dataToSend = {
        amount: values.amount,
        inc_source: values.inc_source,
        date: values.date,
      };
      onSubmit(dataToSend);
    }
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
          onSubmit={handleSubmit}
        >
          {({ setFieldValue }) => (
            <Form>
              {/* Amount */}
              <div className="mb-5">
                <label className="block text-lg font-medium text-gray-700">
                  Amount<span className="text-red-500">*</span>
                </label>
                <Field
                  name="amount"
                  type="number" // Fixed: was "mb-5"
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
                // Expense Category
                <>
                  <div className="mb-5">
                    <label className="block text-lg font-medium text-gray-700">Category<span className="text-red-500">*</span></label>
                    <div className="relative" ref={dropdownRef}>
                      <div
                        className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 cursor-pointer bg-white"
                        onClick={() => {
                          setIsOpenCategories(!isOpenCategories);
                          if (!isOpenCategories) setSearchTerm(''); // Clear search when opening
                        }}
                      >
                        {selectedValue || "Select Category..."}
                      </div>
                      {isOpenCategories && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {/* Search input */}
                          <input
                            type="text"
                            placeholder="Search categories..."
                            className="w-full px-3 py-2 border-b border-gray-200 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <div className="max-h-48 overflow-y-auto">
                            {selectedValue === '' || !Object.keys(subcategories).includes(selectedValue) ? (
                              mainCategories
                                .filter(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((category) => (
                                  <div
                                    key={category}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      if (subcategories[category]) {
                                        setSelectedValue(category); // Show subcategories
                                      } else {
                                        handleCategorySelect(category, setFieldValue); // Select directly
                                      }
                                    }}
                                  >
                                    {category}
                                  </div>
                                ))
                            ) : (
                              <div>
                                <div className="px-3 py-2 bg-gray-50 text-sm text-gray-500 border-b">
                                  Subcategories for {selectedValue}
                                </div>
                                {subcategories[selectedValue]
                                  .filter(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()))
                                  .map((subcategory) => (
                                    <div
                                      key={subcategory}
                                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer pl-6"
                                      onClick={() => handleSubcategorySelect(subcategory, setFieldValue)}
                                    >
                                      {subcategory}
                                    </div>
                                  ))
                                }
                                <div
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-blue-600 text-sm"
                                  onClick={() => setSelectedValue('')}
                                >
                                  ← Back to main categories
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <ErrorMessage name="categories" component="div" className="text-red-500 text-sm mt-1" />
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
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 cursor-pointer border border-gray-300 shadow-sm hover:scale-102"
                >
                  Cancel
                </button>
                {transactionType == "expense" ? (
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 cursor-pointer shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 hover:scale-102"
                  >
                    {modalType === 'edit' ? 'Save Changes' : 'Add'}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 cursor-pointer shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 hover:scale-102"
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
