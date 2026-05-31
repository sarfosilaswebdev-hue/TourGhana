import { apiCall } from "@/api/apicall"
import { useAuth } from "@clerk/expo"
import { useQuery } from "@tanstack/react-query"

export const useUser = ()=>{
    const { getToken, isSignedIn } = useAuth();

    return useQuery({
        queryKey: ['user'],
        enabled: !!isSignedIn,
        queryFn: async ()=>{
              const token = await getToken();
            return  apiCall('/user/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                     Authorization: `Bearer ${token}`,
                }
            })
        }
    })
}