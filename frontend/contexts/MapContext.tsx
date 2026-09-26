/* eslint-disable react-hooks/immutability */
"use client"

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { parseMapUrl } from "./parseMapURL";

const MapContext = createContext<MapContextValue | null>(null);

type MapContextValue = {
  state: MapState;
  userState: UserMapState;
  setOrigin: (point: [number, number]) => void;
  setDestination: (point: [number, number]) => void;
  selectPlace: (id: string, mainLoc: string, lng: number, lat: number) => void;
  removePlace: () => void;
  setRoute: (route: Route) => void;
  setMAPStyle: (style: string) => void;
  set3D: () => void;
  startNavigation: () => void;
  setStagnantNodes: (id: string | number) => void;
};

type Route = {
    blueRoute: number[][];
    blueRouteLen: number;
    standardRoute: number[][];
    standardRouteLen: number;
}

type Node = {
  id: number | string;
  lat: number;
  lng: number;
}

export type MapState = {
  viewport: {
    longitude: number;
    latitude: number;
    zoom: number;
  };

  MAP_STYLE : "liberty"| "bright" | "positron" | "dark" | "fiord"
  is3D: boolean

  mode: "browse" | "route" | "directions";
  
  selectedPlace: {
    name: string;
    mainLoc: string;
    lng: number;
    lat: number;
  } | null;

  origin: [number, number] | null;
  destination: [number, number] | null;

  route: {
    blueRoute: number[][];
    blueRouteLen: number;
    standardRoute: number[][];
    standardRouteLen: number;
  } | null;

  stagnantNodes: Node[] | null;
};

export type UserMapState = {
  isNavigating: boolean;
  isActive: boolean;
  liveLoc: [number, number] | null;
}

const intialMapState: MapState = {
    viewport: {
        longitude: 4.8951,
        latitude: 52.3702,
        zoom: 14
    },
    MAP_STYLE: 'liberty',
    is3D: false,
    mode:"browse",
    selectedPlace: null,
    origin: null,
    destination: null,
    route: null,
    stagnantNodes: [
      { id: 1, lat: 52.3710, lng: 4.8964 },
      { id: 2, lat: 52.3725, lng: 4.8870 }
    ]
}

const intialUserMapState: UserMapState = {
  isActive: true,
  isNavigating: false,
  liveLoc: null // [4.8964,52.3710]
}


export function MapProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [state, setState] = useState<MapState>(intialMapState);
    const [userState, setUserState] = useState<UserMapState>(intialUserMapState);

    const DEMO_NODE = { id: 1, lat: 52.37, lng: 4.89 };
    useEffect(() => {
      const urlState = parseMapUrl(pathname);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(current => ({
        ...current,
        ...urlState,
      }));
    }, [pathname]);

    useEffect(() => {
      if (state.mode === 'route' && state.origin && state.destination && !state.route) {
        const payload = {
            start_lng: state.origin[0],
            start_lat: state.origin[1],
            end_lng: state.destination[0],
            end_lat: state.destination[1]
        };

        fetch('http://localhost:8000/api/v1/get-route', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Route fetched successfully:", data);
            setRoute({
                blueRoute: data.blue_route,
                blueRouteLen: data.blue_route_length,
                standardRoute: data.standard_route,
                standardRouteLen: data.standard_route_len
            });
        })
        .catch(err => {
            console.error("Failed to fetch route:", err);
        });
      }
    }, [state.mode, state.origin, state.destination, state.route]);

    const setOrigin = (point: [number, number]) => {
      setState((current) => ({ ...current, origin: point }));
    };

    const setDestination = (point: [number, number]) => {
      setState((current) => ({ ...current, destination: point }));
    };

    const setRoute = (route: Route) => {
      setState((current) => ({...current, route:route}));
    }

    const set3D = () => {
      setState((current) => ({...current, is3D: !state.is3D}));
    }

    const setMAPStyle = (style: string) => {
      if(style !== "liberty" && style !== "bright"  && style !== "positron"  && style !== "dark"  && style !== "fiord") return;
      setState((current) => ({...current, MAP_STYLE: style}));
    }

    const selectPlace = (id: string, mainLoc: string, lng: number, lat: number) => {
      setState((current) => ({
        ...current,
        selectedPlace: {
          name: id,
          mainLoc,
          lng,
          lat
        },
      }));
    };

    const removePlace = () => {
      setState((current) => ({
        ...current,
        selectedPlace: null
      }));
    }

    const startNavigation = () => {
      setUserState((cur) => ({...cur, isNavigating: true}));
      
      if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
          (position) => {
            const currentLat = position.coords.latitude;
            const currentLng = position.coords.longitude;
            
            setUserState((cur) => ({...cur, liveLoc: [currentLng, currentLat]}));

            const distance = getDistanceInMeters(currentLat, currentLng, DEMO_NODE.lat, DEMO_NODE.lng);
            setUserState((cur) => ({...cur, isActive: distance < 50}));
          },
          (error) => console.error("GPS Error:", error),
          { enableHighAccuracy: true }
        );
      } else {
        alert("Geolocation is not supported by your browser");
      }
    };

    const setStagnantNodes = (id : string | number) => {
      const stg = state?.stagnantNodes?.filter(n => n.id !== id) || [];
      setState((cur) => ({
        ...cur,
        stagnantNodes: stg
      }))
    }

    return (
    <MapContext.Provider
      value={{
        state,
        userState,
        setOrigin,
        setDestination,
        setRoute,
        selectPlace,
        removePlace,
        set3D,
        setMAPStyle,
        startNavigation,
        setStagnantNodes
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMap(){
  const context = useContext(MapContext);

  if (!context) {
    throw new Error("useMap must be used inside MapProvider");
  }

  return context;
}

export function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}