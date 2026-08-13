import { useQuery } from "@tanstack/react-query";
import { request } from "@/api/http";

export type GameServer = {
  id: string;
  name: string;
  region: string;
  loginEndpoint: string;
  available: boolean;
  maintenanceMessage: string | null;
};

export function getGameServers() {
  return request<GameServer[]>("/api/game-servers");
}

export function useGameServers() {
  return useQuery({ queryKey: ["game-servers"], queryFn: getGameServers });
}
