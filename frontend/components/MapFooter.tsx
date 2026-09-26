import { useMap } from "@/contexts/MapContext";
import { CornerUpRight, Layers, LocateFixed, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MapFooter(){
    const {state, removePlace, set3D, setMAPStyle, startNavigation, userState} = useMap();
    const [layers, setLayers] = useState<boolean>(false);
    const router = useRouter();
    const selectedPlace = state.selectedPlace;
    const styles = ["liberty" , "bright" , "positron" , "dark" , "fiord"];
    function handleClickDest(lng: number, lat: number){
        router.push(`/maps/dir//${lng},${lat}`);
    }

    return (
        <nav className="mb-4 fixed bottom-0 left-0 z-10 flex h-[20dvh] min-h-16 max-h-25 w-full items-center justify-between px-4 font-black">
            <div className="relative ">
                {layers && <div className="absolute bottom-full left-0 mb-2 p-2 z-15 flex flex-col bg-white rounded-xl text-sm">
                        <div className="flex gap-3 bg-white p-3 border-b border-black">
                            {styles.map((style) => (
                                <button 
                                key={style}
                                value={style}
                                type="button"
                                aria-label="Open menu"
                                className="p-4 shadow-cyan-950 shadow-lg border cursor-pointer place-items-center rounded-2xl transition text-black bg-cyan-100 duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                                onClick={() => setMAPStyle(style)}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                        <div className="p-3">
                            <button 
                                type="button"
                                className="p-2 size-12 border shadow-cyan-950 shadow-lg cursor-pointer rounded-2xl  transition text-black bg-cyan-100 duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                                onClick={() => set3D()}
                            >
                                3D
                            </button>
                        </div>
                    </div>}
                <button
                    type="button"
                    aria-label="Open menu"
                    className="grid relative size-15 cursor-pointer place-items-center rounded-2xl transition bg-white duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                    onClick={() => setLayers(!layers)}
                >
                    <Layers size={22} color="black" />
                </button>
   
            </div>
            {selectedPlace && <div className="flex relative gap-4 bg-white p-4 text-black items-center rounded-xl">
                <div className="flex flex-col">
                    <p className="font-bold">{selectedPlace.name}</p>
                    <p className="font-normal border-b pb-1 mb-1">{selectedPlace.mainLoc}</p>
                    <p className="text-sm text-blue-400">{selectedPlace.lng}, {selectedPlace.lat}</p>
                </div>
                <button
                    type="button"
                    aria-label="Account"
                    className="grid size-8 cursor-pointer place-items-center rounded-full bg-cyan-300 transition duration-150 hover:bg-cyan-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                    onClick={() => handleClickDest(selectedPlace.lng, selectedPlace.lat)}
                >
                    <CornerUpRight size={10} color="black"/>
                </button>
                <div className="absolute top-1 right-1">
                    <button
                        type="button"
                        aria-label="Account"
                        className="grid size-6 cursor-pointer place-items-center bg-transparent transition duration-150 hover:text-red-500 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                        onClick={removePlace}
                    >
                        <X size={10} color="red"/>
                    </button>
                </div>
            </div>}

            {state.route && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-md bg-neutral-900/95 border border-neutral-700 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col">
                    <div className="divide-y divide-neutral-800">
                        <div className="p-4 relative bg-cyan-950/10">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                            
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h2 className="text-base font-bold text-cyan-400">Blue Route</h2>
                                    <p className="text-xs text-neutral-400 mt-1">Optimized for thermal comfort & water proximity</p>
                                </div>
                                <div className="text-right whitespace-nowrap">
                                    <div className="text-lg font-black text-white">
                                        {(state.route.blueRouteLen / 100).toFixed(2)} km
                                    </div>

                                    <div className="text-xs text-cyan-400 font-medium mt-0.5">
                                        ~{Math.round((state.route.blueRouteLen / 100) * 10)} min walk
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!userState.isNavigating && (
                            <div className="p-4 relative opacity-75">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff3cb1]"></div>
                                
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <h2 className="text-base font-bold text-[#ff3cb1]">Standard Route</h2>
                                        <p className="text-xs text-neutral-500 mt-1">Shortest distance (Exposed)</p>
                                    </div>
                                    <div className="text-right whitespace-nowrap">
                                        <div className="text-lg font-bold text-neutral-300">
                                            {state.route.standardRouteLen ? (state.route.standardRouteLen / 100).toFixed(2) : "-"} km
                                        </div>
                                        <div className="text-xs text-neutral-500 mt-0.5">
                                            ~{state.route.standardRouteLen ? Math.round((state.route.standardRouteLen / 100) * 10) : ""} min walk
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {!userState.isNavigating && (
                        <div className="p-4 bg-neutral-900">
                            <button 
                                onClick={startNavigation}
                                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm py-3.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(6,182,212,0.2)] hover:shadow-[0_4px_20px_rgba(6,182,212,0.4)] tracking-wide"
                            >
                                START BLUE ROUTE
                            </button>
                        </div>
                    )}
                </div>
            )}

            <button
                type="button"
                aria-label="Account"
                className="grid size-10 cursor-pointer place-items-center rounded-2xl border-2 border-black bg-white transition duration-150 hover:bg-gray-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
                <LocateFixed size={20} color="black"/>
            </button>
        </nav>
    );
}