// src/components/profile/ProfileSection.jsx
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";

import VerticalNavbar from "./VerticalNavbar"

export default function Profile() {
  // Mock user data — replace with API call in real app
  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    // TODO: avatar: null, // or a URL
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ user_name: "", email: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not logged in");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setFormData({ user_name: data.user_name, email: data.email });
        } else {
          toast.error("Failed to load profile");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading profile");
      }
    };

    fetchProfile();
  }, []);

  // Initialize form data from user
  useEffect(() => {
    setFormData({ user_name: user.user_name, email: user.email });
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({ user_name: user.user_name, email: user.email });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData.user_name || !formData.email) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSaving(true);
    toast.loading("Saving changes...");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_name: formData.user_name,
          email: formData.email
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setIsEditing(false);
        toast.dismiss();
        toast.success("Profile updated!");
      } else {
        toast.dismiss();
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Network error");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate avatar initials
  const getInitials = (name) => {
    if (!name) return "?";

    return name
      .toString() // in case it's not a string
      .trim()
      .split(/\s+/) // split on one or more spaces
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "??";
  };
  return (
    <>
      <div className="bg-blue-50">
        <div className="fixed w-28 2xl:w-64 hidden md:block p-5 shadow-current/20 shadow-xl bg-blue-50">
          <VerticalNavbar />
        </div>
        <div className={`2xl:ml-64 lg:ml-28 bg-blue-50 gap-y-6 flex flex-col ${`h-screen` ? `h-screen` : `h-full`} `}>
          <div className={`flex items-center justify-center h-screen`}>
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 w-[50%]">
              <div className="flex flex-col items-center mb-6">
                {/* Avatar */}
                <div className="relative mb-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-indigo-100">
                      {getInitials(user.user_name)}
                    </div>
                  )}
                </div>

                {/* Name */}
                <h1 className="text-2xl font-bold text-gray-900">{user.user_name}</h1>
                <p className="text-gray-500">{user.email}</p>
              </div>

              {/* Profile Info */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.user_name}
                      onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={isSaving}
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{user.user_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={isSaving}
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end gap-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 cursor-pointer border border-gray-300 shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 cursor-pointer shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 cursor-pointer shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </div>
      </div>
    </>
  )
}
