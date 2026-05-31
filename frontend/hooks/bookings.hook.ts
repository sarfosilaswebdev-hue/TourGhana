import { apiCall } from "@/api/apicall";
import { CreateBookingPayload } from "@/Utils/types";
import { useAuth } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (bookingData: CreateBookingPayload) => {
      const token = await getToken(); // ✅ awaited
      return apiCall("/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

export const useGetUserBookings = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {   // ✅ async
      const token = await getToken(); // ✅ awaited
      return apiCall("/bookings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useGetBookingById = (id: string) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["bookings", id],
    queryFn: async () => {   // ✅ async
      const token = await getToken(); // ✅ awaited
      return apiCall(`/bookings/${id}`, {
        method: "GET",        // ✅ was POST, should be GET
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    },
    enabled: !!id,
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return apiCall(`/bookings/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken(); // ✅ awaited
      return apiCall(`/bookings/${id}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};