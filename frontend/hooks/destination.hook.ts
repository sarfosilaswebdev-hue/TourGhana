import { apiCall } from "@/api/apicall";
import { Category } from "@/Utils/types";
import { useQuery } from "@tanstack/react-query";

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
      if(!search) return
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
