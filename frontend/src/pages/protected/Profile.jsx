// src/components/profile/ProfileSection.jsx
import { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import VerticalNavbar from "./VerticalNavbar"
import HorizontalNavbar from "./HorizontalNavbar";

export default function ProfileSection() {
  // 1. ALL HOOKS MUST BE AT THE TOP
  const avatarMenuRef = useRef(null); // This goes first with other hooks

  const [user, setUser] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update the click outside useEffect
  useEffect(() => {
    const handleClickOutside = () => {
      setShowAvatarMenu(false);
    };

    if (showAvatarMenu) {
      // Close menu after a short delay when clicking anywhere
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showAvatarMenu]);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        // Ensure avatar URL is properly set
        if (data.avatar && !data.avatar.startsWith('http')) {
          data.avatar = `http://localhost:5000${data.avatar}`;
        }
        setAvatarPreview(data.avatar || null);
        formik.setValues({ user_name: data.user_name, email: data.email });
      } else toast.error("Failed to load profile");
    } catch (err) {
      toast.error("Network error");
    }
  };

  // Formik for Name + Email
  const formik = useFormik({
    initialValues: { user_name: "", email: "" },
    validationSchema: Yup.object({
      user_name: Yup.string().required("Name is required").min(2, "Too short"),
      email: Yup.string().email("Invalid email").required("Email is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user || { ...user, ...values });
          toast.success("Profile updated!");
        } else toast.error(data.message || "Update failed");
      } catch (err) {
        toast.error("Something went wrong");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Avatar Upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("avatar", file);

    fetch("http://localhost:5000/profile/avatar", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.avatarUrl) {
          // Ensure we have the full URL
          const fullAvatarUrl = data.avatarUrl.startsWith('http')
            ? data.avatarUrl
            : `http://localhost:5000${data.avatarUrl}`;

          setUser({ ...user, avatar: fullAvatarUrl });
          setAvatarPreview(fullAvatarUrl);
          toast.success("Avatar updated!");
        } else {
          toast.error(data.message || "Upload failed");
        }
      })
      .catch(() => toast.error("Upload failed"));
  };

  // Delete Avatar
  // Delete Avatar - Fixed version
  const handleDeleteAvatar = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/profile/avatar", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await res.json();
      console.log("📦 Response data:", data);

      if (res.ok) {
        toast.success("Avatar deleted successfully!");

        // Force immediate page reload
        window.location.reload();
      } else {
        toast.error(data.message || "Failed to delete avatar");
      }
    } catch (err) {
      toast.error("Network error while deleting avatar");
    }
  };

  // Change Password
  const passwordFormik = useFormik({
    initialValues: { current: "", new: "", confirm: "" },
    validationSchema: Yup.object({
      current: Yup.string().required("Current password is required"),
      new: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("New password is required"),
      confirm: Yup.string()
        .oneOf([Yup.ref("new")], "Passwords must match")
        .required("Please confirm your new password"),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const res = await fetch("http://localhost:5000/profile/password", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            currentPassword: values.current,
            newPassword: values.new,
          }),
        });
        if (res.ok) {
          toast.success("Password changed!");
          resetForm();
          setIsChangingPassword(false);
        } else {
          const err = await res.json();
          toast.error(err.message || "Failed");
        }
      } catch {
        toast.error("Network error");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Delete Account
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("http://localhost:5000/profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        localStorage.removeItem("token");
        toast.success("Account deleted");
        setTimeout(() => (window.location.href = "/login"), 1500);
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getInitials = (name) =>
    name
      ? name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
      : "??";

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );

  return (
    <>
      <div className="min-h-screen">
        <div className="fixed w-28 2xl:w-64 hidden lg:block p-5 shadow-current/20 shadow-xl bg-blue-50">
          <VerticalNavbar />
        </div>

        <div className="block lg:hidden">
          <HorizontalNavbar />
        </div>

        <div className={`2xl:ml-64 lg:ml-28 bg-transparent gap-y-6 flex flex-col min-h-screen h-full items-center py-8`}>
          <div className="w-[95%] max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Profile
              </h1>
              <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Avatar Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center transform hover:scale-[1.02] transition-all duration-300 max-h-80 relative">
                <div ref={avatarMenuRef} className="relative inline-block group"> {/* Add ref here */}
                  <label htmlFor="avatar" className="cursor-pointer block">
                    {avatarPreview || user.avatar ? (
                      <img
                        src={avatarPreview || user.avatar}
                        alt="Avatar"
                        className="w-32 h-32 rounded-full object-cover border-4 border-current/20 shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                        {getInitials(user.user_name)}
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-8 h-8 text-white mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-white text-sm font-medium">Change Photo</span>
                      </div>
                    </div>
                  </label>
                  <input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

                  {/* Avatar Menu Button */}
                  {(avatarPreview || user.avatar) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowAvatarMenu(!showAvatarMenu);
                      }}
                      className="absolute top-0 right-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm hover:bg-gray-800 transition-colors duration-200 group/avatar"
                    >
                      <svg className="w-4 h-4 transition duration-300 group-hover/avatar:scale-120" xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth={3.75} d="M12 12h.01v.01H12zm0-7h.01v.01H12zm0 14h.01v.01H12z"></path>
                      </svg>
                    </button>
                  )}
                </div>

                {/* Avatar Dropdown Menu */}
                {showAvatarMenu && (
                  <div className="absolute top-12 right-8 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-32">
                    <button
                      onClick={() => {
                        document.getElementById('avatar').click();
                        setShowAvatarMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Change
                    </button>
                    <button
                      onClick={handleDeleteAvatar}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                )}

                <h2 className="mt-6 text-2xl font-bold text-gray-900">{user.user_name}</h2>
                <p className="text-gray-500 mt-1">{user.email}</p>
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  Active
                </div>
              </div>

              {/* Forms Card */}
              <div className="lg:col-span-2 space-y-8">
                {/* Edit Profile */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 transform hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        {...formik.getFieldProps("user_name")}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
                      />
                      {formik.touched.user_name && formik.errors.user_name && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {formik.errors.user_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        {...formik.getFieldProps("email")}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
                      />
                      {formik.touched.email && formik.errors.email && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {formik.errors.email}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={formik.isSubmitting || !formik.dirty}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-blue-500/25"
                    >
                      {formik.isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving Changes...
                        </span>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </form>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 transform hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
                  </div>
                  {isChangingPassword ? (
                    <form onSubmit={passwordFormik.handleSubmit} className="space-y-5">
                      <div>
                        <input
                          type="password"
                          placeholder="Current password"
                          {...passwordFormik.getFieldProps("current")}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50/50"
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          placeholder="New password"
                          {...passwordFormik.getFieldProps("new")}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50/50"
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          {...passwordFormik.getFieldProps("confirm")}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50/50"
                        />
                        {passwordFormik.errors.confirm && passwordFormik.touched.confirm && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {passwordFormik.errors.confirm}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => { setIsChangingPassword(false); passwordFormik.resetForm(); }}
                          className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition duration-300 cursor-pointer border border-gray-300 shadow-sm hover:scale-[1.02]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={passwordFormik.isSubmitting}
                          className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-600 text-white rounded-xl hover:from-red-700 hover:to-red-700 transform hover:scale-[1.02] transition duration-300 font-medium shadow-lg shadow-red-500/25"
                        >
                          {passwordFormik.isSubmitting ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="group text-blue-600 hover:text-blue-700 font-medium text-lg transition-all duration-200 inline-flex items-center"
                    >
                      Change Password
                      <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Danger Zone */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-8 transform hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-red-800">Danger Zone</h3>
                  </div>
                  <p className="text-red-700 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transform hover:scale-[1.02] transition-all duration-200 font-medium shadow-lg shadow-red-500/25"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-8 max-w-md mx-4 transform animate-scale-in">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-center text-gray-900">Delete Account?</h3>
                  <p className="mt-3 text-gray-600 text-center">This action cannot be undone. All your data will be permanently removed.</p>
                  <div className="mt-8 flex gap-4">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transform hover:scale-[1.02] transition-all duration-200 font-medium disabled:opacity-70 disabled:hover:scale-100"
                    >
                      {isDeleting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </span>
                      ) : (
                        "Delete Account"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </div>
      </div>
    </>
  );
}
