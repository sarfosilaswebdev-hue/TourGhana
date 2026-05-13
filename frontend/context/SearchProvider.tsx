import { useGetAllDestinations, useSearchDestinations } from "@/hooks/destination.hook";
import { Destination } from "@/Utils/types";
import { createContext, useContext, useState } from "react";

interface SearchContextType {
  search: string | null;
  setSearch: (value: string) => void;
  searchResult: Destination[];
  isFetching: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [search, setSearch] = useState<string | null>(null);

  const { data, isFetching } = useSearchDestinations(search)

  const searchResult = data?.destinations || [];
  return (
    <SearchContext.Provider
      value={{ search, setSearch, searchResult, isFetching }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("useSearch must be used within SearchProvider");
  }

  return context;
};