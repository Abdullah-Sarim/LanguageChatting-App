import useLogout from "../hooks/useLogout";

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
   // ✅ ALWAYS called

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-500 flex items-center justify-center bg-black/50 animate-fadeIn">
      <div className="bg-gray-300 p-6 rounded-lg w-96 animate-scaleIn">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl text-red-500 font-semibold">{title}</h2>

          <button
            className="rounded transition font-medium hover:bg-green-500 text-black px-2 py-1 bg-transparent"
            onClick={onCancel}
          >
            ✖
          </button>
        </div>

        <p className="mt-2 text-gray-600">{message}</p>

        <div className="flex justify-end gap-3 mt-6">
          <button className="btn btn-sm" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-sm btn-error" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
