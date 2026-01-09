// import toast from "react-hot-toast";
// import { axiosInstance } from "./axios";

// export const signup = async (signupData) => {
//   const response = await axiosInstance.post("/auth/signup", signupData);
//   return response.data;
// };

// export const login = async (loginData) => {
//   const response = await axiosInstance.post("/auth/login", loginData);
//   return response.data;
// };

// export const logout = async () => {
//   const response = await axiosInstance.post("/auth/logout");
//   try{
//   toast.success("Logged Out");
//   } catch {
//     toast.error("Logout Failed")
//   } 
//   return response.data;
// };

// export const updateProfile = async (profileData) => {
//   try {
//     const response = await axiosInstance.put(
//       "/users/profile",
//       profileData
//     );

//     toast.success("Profile updated successfully");
//     return response.data;
//   } catch (error) {
//     toast.error(
//       error.response?.data?.message || "Failed to update profile"
//     );
//     throw error;
//   }
// };
// // const logout = async () => {
// //   // const confirmLogout = window.confirm("Are you sure you want to logout?");
// //   if (!onConfirm) return;

// //   try {
// //     await api.get("/user/logout");
// //     localStorage.removeItem("jwt");
// //     toast.success("Logged out");
// //     navigate("/login");
// //   } catch {
// //     toast.error("Logout failed");
// //   }
// // };




// // export const getAuthUser = async () => {
// //   try {
// //     const res = await axiosInstance.get("/auth/me");
// //     return res.data;
// //   } catch (error) {
// //     console.log("Error in getAuthUser:", error);
// //     return null;
// //   }
// // };



// export const completeOnboarding = async (userData) => {
//   const response = await axiosInstance.post("/auth/onboarding", userData);
//   return response.data;
// };

// export async function getUserFriends() {
//   const response = await axiosInstance.get("/users/friends");
//   return response.data;
// }

// export async function getRecommendedUsers() {
//   const response = await axiosInstance.get("/users");
//   return response.data;
// }

// export async function getOutgoingFriendReqs() {
//   const response = await axiosInstance.get("/users/outgoing-friend-requests");
//   return response.data;
// }

// export async function sendFriendRequest(userId) {
//   const response = await axiosInstance.post(`/users/friend-request/${userId}`);
//   return response.data;
// }

// export async function getFriendRequests() {
//   const response = await axiosInstance.get("/users/friend-requests");
//   return response.data;
// }

// export async function acceptFriendRequest(requestId) {
//   const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
//   return response.data;
// }

// export async function getStreamToken() {
//   const response = await axiosInstance.get("/chat/token");
//   return response.data;
// }



import toast from "react-hot-toast";
import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  try{
  toast.success("Logged Out");
  } catch {
    toast.error("Logout Failed")
  } 
  return response.data;
};

export const updateProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put(
      "/users/profile",
      profileData
    );

    toast.success("Profile updated successfully");
    return response.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to update profile"
    );
    throw error;
  }
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export const getUserFriends = async () => {
  const res = await axiosInstance.get("/users/friends");
  return res.data.friends || [];
};


export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}












