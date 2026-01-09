import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../lib/api";

const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {

      if (!updatedUser || !updatedUser._id) {
        console.error("Invalid user returned from update");
        return;
      }

      // 🔥 THIS LINE IS THE FIX
      queryClient.setQueryData(["authUser"], {
        user: updatedUser,
      });
    },
  });
};

export default useUpdateProfile;
