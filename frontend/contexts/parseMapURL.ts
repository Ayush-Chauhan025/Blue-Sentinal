import type { MapState } from "./MapContext";

export function parseMapUrl(pathname: string): Partial<MapState> {
    const path = pathname.split('/').filter(Boolean);
    console.log(path);
    
    if (path[0] == 'maps' && path[1] == 'dir') {
        if (path.length === 3) {
            const dest = (path[2].split(',')).map((num) => +num);
            return {
                mode: 'directions',
                destination: [dest[0], dest[1]],
                origin: null,
                selectedPlace: null,
                route: null
            }
        } else {
            const dest = (path[3].split(',')).map((num) => +num);
            const ogn = (path[2].split(',')).map((num) => +num);
            
            return {
                mode: 'route',
                destination: [dest[0], dest[1]],
                origin: [ogn[0], ogn[1]],
                route: null
            };
        }
    }

    return {
        mode: 'browse',
        selectedPlace: null,
        destination: null,
        route: null,
        origin: null
    }
}