"use client";

import { setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Layer, MapLayerMouseEvent, Marker, Popup, Source } from "react-map-gl/maplibre";
import { getDistanceInMeters, useMap } from "@/contexts/MapContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

if (typeof window !== "undefined") {
  setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
}

const MAP_STYLES = {
  liberty: "https://tiles.openfreemap.org/styles/liberty",
  bright: "https://tiles.openfreemap.org/styles/bright",
  positron: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
  fiord: "https://tiles.openfreemap.org/styles/fiord",
} as const;

export default function MapComponent() {
  const { state, selectPlace, userState, setStagnantNodes } = useMap();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const handleMapClick = async (event: MapLayerMouseEvent) => {
    console.log(state.mode);
    if (state.mode === 'browse') {
      const lng = +(event.lngLat.lng).toFixed(7);
      const lat = +(event.lngLat.lat).toFixed(7);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        const foundName =
          data.name ||
          data.address?.road ||
          data.address?.neighbourhood ||
          data.address?.suburb ||
          "Unknown Location";
        const regionName = data.address?.state;
        const country = data.address?.country;
        const mainLoc: string = (regionName && country) ? `${regionName}, ${country}` : country ? `${country}` : "";

        selectPlace(foundName, mainLoc, lng, lat);
      } catch (error) {
        console.error("Failed to fetch location name:", error);
        selectPlace("Unknown Location", "", lng, lat);
      }
    }

    if (state.mode === 'directions') {
      if (!state.destination) return;
      const lng = +(event.lngLat.lng).toFixed(7);
      const lat = +(event.lngLat.lat).toFixed(7);
      router.push(`/maps/dir/${lng},${lat}/${state.destination[0]},${state.destination[1]}`);
    }
  };

  return (
    <div className="h-screen w-screen relative">
      <Map
        initialViewState={{
          longitude: state.viewport.longitude,
          latitude: state.viewport.latitude,
          zoom: state.viewport.zoom,
        }}
        pitch={state.is3D ? 60 : 0}
        bearing={state.is3D ? -17.6 : 0}
        mapStyle={MAP_STYLES[state.MAP_STYLE]}
        style={{
          width: '100%',
          height: '100%',
        }}
        onLoad={(event) => event.target.resize()}
        onClick={handleMapClick}
      >
        {state.origin && (
          <Marker longitude={state.origin[0]} latitude={state.origin[1]} color="#10B981" />
        )}

        {state.destination && (
          <Marker longitude={state.destination[0]} latitude={state.destination[1]} color="#EF4444" />
        )}

        {state.route?.blueRoute && (
          <Source
            id="blue-route"
            type="geojson"
            data={{
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: state.route.blueRoute,
              },
            }}
          >
            <Layer
              id="route-line"
              type="line"
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
              paint={{
                "line-color": "#000ecd",
                "line-width": 6,
                "line-opacity": 0.8,
              }}
            />
          </Source>
        )}

        {state.route?.standardRoute && (
          <Source
            id="standard-route"
            type="geojson"
            data={{
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: state.route.standardRoute,
              },
            }}
          >
            <Layer
              id="stroute-line"
              type="line"
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
              paint={{
                "line-color": "#ff0064",
                "line-width": 6,
                "line-opacity": 0.8,
              }}
            />
          </Source>
        )}

        {userState.liveLoc && userState.isNavigating && (
          <Marker longitude={userState.liveLoc[0]} latitude={userState.liveLoc[1]}>
            <div className="relative flex items-center justify-center w-6 h-6">
              <div className="absolute w-full h-full bg-cyan-400 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-3 h-3 bg-cyan-500 border-2 border-white rounded-full shadow-lg"></div>
            </div>
          </Marker>
        )}

        {state.stagnantNodes && userState.liveLoc && state.stagnantNodes.map((node) => {
          if(!userState.liveLoc) return;
          const distance = getDistanceInMeters(userState.liveLoc[1], userState.liveLoc[0], node.lat, node.lng);
          if(distance < 100) return <Marker 
            key={node.id} 
            longitude={node.lng} 
            latitude={node.lat}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              if(selectedNode?.id === node.id) setSelectedNode(null);
              else setSelectedNode(node);
            }}
          >
            <div className="relative flex items-center justify-center w-8 h-8 cursor-pointer hover:scale-110 transition-transform">
              <div className="absolute w-full h-full bg-red-500 rounded-full animate-ping opacity-60"></div>
              <div className="relative flex items-center justify-center w-6 h-6 bg-neutral-900 border-2 border-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                <span className="text-xs">💧</span>
              </div>
            </div>
          </Marker>
        })}

        {selectedNode && (
          <Popup
            longitude={selectedNode.lng}
            latitude={selectedNode.lat}
            closeOnClick={false}
            onClose={() => setSelectedNode(null)}
            className="z-50"
            anchor="bottom"
          >
            <div className="bg-neutral-900 border border-neutral-700 p-4 rounded-xl text-white shadow-2xl max-w-xs text-center">
              <h3 className="font-bold text-red-400 mb-1">Stagnation Node</h3>
              
              {(() => {
                if (!userState.liveLoc) return <p className="text-sm text-neutral-400">Start your route to track distance.</p>;
                
                const distance = getDistanceInMeters(userState.liveLoc[1], userState.liveLoc[0], selectedNode.lat, selectedNode.lng);
                
                if (distance > 50) {
                  return (
                    <div className="mt-3">
                      <p className="text-xs text-neutral-400 mb-2">
                        You are <b>{Math.round(distance)}m</b> away.
                      </p>
                      <div className="bg-neutral-800 text-neutral-500 py-2 rounded-lg text-xs font-bold">
                        Walk closer to unlock camera
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="mt-3">
                      <p className="text-xs text-green-400 font-bold mb-2">Target in range!</p>
                      <label className="block w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-2 px-4 rounded-lg cursor-pointer transition-all">
                        VERIFY
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.readAsDataURL(file);

                              reader.onload = async () => {
                                const base64Image = reader.result;
                                try{
                                  const response = await fetch(`/api/nodes/verify`,{
                                    method: "POST",
                                    headers: {"Content-Type": "application/json"},
                                    body:JSON.stringify({
                                      image: base64Image, 
                                      nodeId: selectedNode.id,
                                      userId: "user_123"
                                    })
                                  })
                                  const result = await response.json();

                                  if(result.success){
                                    alert(`${result.message}`);
                                    setStagnantNodes(selectedNode.id);
                                    setSelectedNode(null);
                                  } else {
                                    alert(`${result.message}`);
                                  }
                                } catch (err) {
                                  console.log(err)
                                }
                              }
                            }  
                          }} 
                        />
                      </label>
                    </div>
                  );
                }
              })()}
            </div>
          </Popup>
        )}

        {state.is3D && (
          <Source id="openmaptiles-buildings" type="vector" url="https://tiles.openfreemap.org/planet">
            <Layer
              id="3d-buildings"
              type="fill-extrusion"
              source-layer="building"
              minzoom={14}
              paint={{
                "fill-extrusion-color": "#aaa",
                "fill-extrusion-height": ["coalesce", ["get", "render_height"], 10],
                "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
                "fill-extrusion-opacity": 0.8,
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
}