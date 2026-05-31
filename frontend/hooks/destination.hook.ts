import { apiCall } from "@/api/apicall";
import { Category } from "@/Utils/types";
import { useAuth } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface GetAllDestinationsType {
  category?: "All" | Category;
  limit: number;
  search?: string | null | undefined;
}

export const useGetAllDestinations = ({
  category = "All",
  limit = 10,
}: {
  category?: "All" | Category;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["destinations", category, limit],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (category && category !== "All") {
        params.append("category", category);
      }

      if (limit) {
        params.append("limit", limit.toString());
      }

      return apiCall(`/destinations?${params.toString()}`, {
        method: "GET",
      });
    },
  });
};

export const useSearchDestinations = (search: string | null) => {
  return useQuery({
    queryKey: ["search-destinations", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (!search) return;
      params.append("search", search);

      return apiCall(`/destinations?${params.toString()}`, {
        method: "GET",
      });
    },

    enabled: !!search && search.trim().length > 0,
  });
};

export const useGetDestinationById = (destinationId: string | string[]) => {
  return useQuery({
    queryKey: ["destination", destinationId],
    enabled: !!destinationId,
    queryFn: async () => {
      const normalizedId = Array.isArray(destinationId)
        ? destinationId[0]
        : destinationId;

      return apiCall(`/destinations/${normalizedId}`, {
        method: "GET",
      });
    },
  });
};

// Single toggle hook — backend POST /favorite/:id already adds OR removes
export const useToggleFavorite = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (destinationId: string) => {
      const token = await getToken();
      return apiCall(`/destinations/favorite/${destinationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    },
    // Optimistic update: instantly remove from favorites list on toggle-off
    onMutate: async (destinationId: string) => {
      await queryClient.cancelQueries({ queryKey: ["favorite-destinations"] });
      const previous = queryClient.getQueryData(["favorite-destinations"]);
      queryClient.setQueryData(["favorite-destinations"], (old: any) => {
        if (!old?.data) return old;
        const isCurrentlyFavorited = old.data.some((d: any) => d.id === destinationId);
        if (isCurrentlyFavorited) {
          return { ...old, data: old.data.filter((d: any) => d.id !== destinationId) };
        }
        return old;
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["favorite-destinations"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-destinations"] });
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
    },
  });
};

export const useGetFavoriteDestinations = () => {
  const {getToken} = useAuth();
  return useQuery({
    queryKey: ["favorite-destinations"],
    queryFn: async () => {
      const token = await getToken();
      return apiCall(`/destinations/favorites`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
    },
    enabled: !!getToken,
  });
};