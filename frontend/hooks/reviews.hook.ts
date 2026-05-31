import { apiCall } from "@/api/apicall";
import { useAuth } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetUserReviews = () => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["reviews", "my"],
    queryFn: async () => {
      const token = await getToken();
      return apiCall("/reviews/my", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useGetDestinationReviews = (destinationId: string) => {
  return useQuery({
    queryKey: ["reviews", "destination", destinationId],
    queryFn: async () => {
      return apiCall(`/reviews?destinationId=${destinationId}`, {
        method: "GET",
      });
    },
    enabled: !!destinationId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (payload: {
      destinationId: string;
      rating: number;
      comment?: string;
    }) => {
      const token = await getToken();
      return apiCall("/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return apiCall(`/reviews/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};
