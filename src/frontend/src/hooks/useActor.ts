import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";

const ACTOR_QUERY_KEY = "actor";

let cachedActor: backendInterface | null = null;

export function useActor() {
  const queryClient = useQueryClient();

  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY],
    queryFn: async () => {
      if (cachedActor) return cachedActor;
      const actor = await createActorWithConfig();
      cachedActor = actor;
      return actor;
    },
    staleTime: Number.POSITIVE_INFINITY,
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => !query.queryKey.includes(ACTOR_QUERY_KEY),
      });
      queryClient.refetchQueries({
        predicate: (query) => !query.queryKey.includes(ACTOR_QUERY_KEY),
      });
    }
  }, [actorQuery.data, queryClient]);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
  };
}
