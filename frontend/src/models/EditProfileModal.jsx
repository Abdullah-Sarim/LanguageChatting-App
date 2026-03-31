import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import useUpdateProfile from "../hooks/useUpdateProfile";
import AvatarPicker from "../components/AvatarPicker";
import { LANGUAGES } from "../constants";
import { X, Star } from "lucide-react";

const EditProfileModal = ({ open, onClose }) => {
  const { authUser } = useAuthUser();
  const { mutate, isPending } = useUpdateProfile();

  const [form, setForm] = useState({
    fullName: authUser.fullName || "",
    bio: authUser.bio || "",
    location: authUser.location || "",
    profilePic: authUser.profilePic || "",
    nativeLanguage: authUser.nativeLanguage || "",
    learningLanguage: authUser.learningLanguage || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    mutate(form, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  if (!open) return null;

  return (
    <div className="modal modal-open">
      {/*scroll added here */}
      <div className="modal-box max-h-[90vh] overflow-y-auto relative">
        <button
          className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
        <h3 className="font-bold text-lg">Edit Profile</h3>

        <div className="space-y-4 mt-4">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="avatar mb-4">
              <div className="w-24 rounded-full ring ring-primary ring-offset-2">
                <img src={form.profilePic} alt="Current avatar" />
              </div>
            </div>
            <p className="text-sm text-base-content/60 mb-2">Select a new avatar:</p>
            <AvatarPicker
              selectedAvatar={form.profilePic}
              onSelect={(avatar) =>
                setForm({ ...form, profilePic: avatar })
              }
            />
          </div>

          {/* Rating Display */}
          {(authUser.averageRating || authUser.totalRatings) && (
            <div className="flex items-center justify-center gap-2 p-3 bg-base-100 rounded-lg">
              <Star className="fill-yellow-400 text-yellow-400" size={24} />
              <span className="font-semibold text-xl">
                {authUser.averageRating || 0}
              </span>
              <span className="text-base-content/60">
                ({authUser.totalRatings || 0} {authUser.totalRatings === 1 ? "rating" : "ratings"})
              </span>
            </div>
          )}

          {/* Full Name */}
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className="input input-bordered w-full"
          />

          {/* Location */}
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="input input-bordered w-full"
          />

          {/* Native Language */}
          <div>
            <label className="label">
              <span className="label-text font-medium">
                Native Language
              </span>
            </label>
            <select
              name="nativeLanguage"
              value={form.nativeLanguage}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">Select native language</option>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Learning Language */}
          <div>
            <label className="label">
              <span className="label-text font-medium">
                Learning Language
              </span>
            </label>
            <select
              name="learningLanguage"
              value={form.learningLanguage}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">Select learning language</option>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Bio */}
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Bio"
            className="textarea textarea-bordered w-full"
          />
        </div>

        <div className="modal-action mt-6">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save"}
          </button>

          <button className="btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
