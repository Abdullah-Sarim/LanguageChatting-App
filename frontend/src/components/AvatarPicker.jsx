import { AVATARS } from "../constants/avatars";

const AvatarPicker = ({ selectedAvatar, onSelect }) => {
  return (
    <div className="grid grid-cols-5 gap-4">
      {AVATARS.map((avatar) => {
        const isSelected = selectedAvatar === avatar.src;

        return (
          <button
            key={avatar.id}
            onClick={() => onSelect(avatar.src)}
            className="relative focus:outline-none"
            aria-pressed={isSelected}
          >
            {/* Selection ring */}
            <div
              className={`rounded-full p-1 transition-all duration-200
                ${
                  isSelected
                    ? "ring-4 ring-indigo-500 scale-105"
                    : "hover:ring-2 hover:ring-gray-300"
                }`}
            >
              <img
                src={avatar.src}
                alt={avatar.id}
                className="w-18 h-17 rounded-full object-cover"
              />
            </div>

            {isSelected && (
              <span className="absolute -top-1 -right-1 bg-indigo-500 rounded-full p-1">
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AvatarPicker;
