import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false, // auth check
  });

  return { isLoading: authUser.isLoading, authUser: authUser.data?.user };
};
export default useAuthUser;


// import { useQuery } from "@tanstack/react-query";
// import { getAuthUser } from "../lib/api";

// const useAuthUser = () => {
//   const { data, isLoading } = useQuery({
//     queryKey: ["authUser"],
//     queryFn: getAuthUser,
//     retry: false,
//     refetchOnWindowFocus: false,
//     initialData: null, // 🔑 CRITICAL
//   });

//   return {
//     isLoading,
//     authUser: data, // 🔑 DO NOT access `.user`
//   };
// };

// export default useAuthUser;

