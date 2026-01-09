import { X } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import EditProfileModal from "./EditProfileModal";
import { useState } from "react";

const ProfileInsetModal = ({ isOpen, onClose }) => {
  const { authUser } = useAuthUser();
  const [openEdit, setOpenEdit] = useState(false);

  if (!isOpen || !authUser) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Inset Box */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-base-200 rounded-2xl shadow-xl relative animate-scaleIn">

          {/* Close button */}
          <button
            className="absolute right-4 top-4 btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
          >
            <X />
          </button>

          {/* Content */}
          <div className="p-6 text-center">
            {/* Avatar */}
            <div className="avatar mb-4">
              <div className="w-30 rounded-full ring ring-primary ring-offset-2">
                <img src={authUser.profilePic} alt="Profile" />
              </div>
            </div>

            {/* Name */}
            <h2 className="text-[25px] font-bold">
              {authUser.fullName}
              
            </h2>
            
            <span className="text-green-500 font-semibold "><span className="size-2 rounded-full bg-success inline-block mr-1" />
              Online</span>
            {/* Bio */}
            <p className="text-[16px] text-base-content/75 my-2">
              {authUser.bio || "No bio added"}
            </p>

            {/* Languages */}
            <div className="flex justify-center gap-5 mt-3 flex-wrap">
              <span className="p-4 text-[14px] badge badge-outline">
                Native: {authUser.nativeLanguage}
              </span>
              <span className="p-4 text-[14px] badge badge-outline">
                Learning: {authUser.learningLanguage}
              </span>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-3 mt-5 text-[16px]">
              <Info label="Location" value={authUser.location} />
              <Info
                label="Friends"
                value={authUser.friends?.length || 0}
              />
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-10 justify-center">
              <button
                className="btn btn-primary w-30"
                onClick={() => setOpenEdit(true)}
              >
                Edit Profile
              </button>

              <button
                className="btn btn-outline w-30"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
      />
    </>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-base-100 rounded-xl p-3">
    <p className="text-xs text-base-content/60">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default ProfileInsetModal;
