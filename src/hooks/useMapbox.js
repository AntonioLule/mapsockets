import {useRef, useEffect, useState, useCallback} from 'react';
import mapboxgl from 'mapbox-gl';
import { v4 } from 'uuid';
import { Subject } from 'rxjs';

mapboxgl.accessToken = 'pk.eyJ1IjoibHVsZXYiLCJhIjoiY2tzeXlzMjZyMThidzJubnlhMGplamhzZSJ9.ADlkblfJSWJLKR3JSSpuSQ';

export const useMapbox = (puntoInicial) => {

    const mapaDiv = useRef();

    const setRef = useCallback(
        (node) => {
            mapaDiv.current = node;
        },
        [],
    );
    
    // Referencia a los marcadores
    const marcadores = useRef({});

    // Observables de RXjs
    const movimientoMarcador = useRef( new Subject());
    const nuevoMarcador = useRef( new Subject());

    // Mapa y coords
    const mapa = useRef();
    const [coords, setCoords] = useState(puntoInicial);

    // Funcion para agregar marcadores
    const agregarMarcador = useCallback((ev, id) => {
                                     
                                    // or
        const { lng, lat } = ev.lngLat || ev;

        const marker = new mapboxgl.Marker();
        marker.id = id ?? v4();

        marker
            .setLngLat([lng, lat])
            .addTo(mapa.current)
            .setDraggable(true);

        marcadores.current[ marker.id ] = marker;

        if(!id){
            
            nuevoMarcador.current.next({
                id: marker.id,
                lng,
                lat
            });
    
        }

        //escucher movimientos del marcador
        marker.on('drag', ({target}) => {
            const { id } = target;
            const { lng, lat } = target.getLngLat(); 

            // TODO: emitir los cambios del marcador
            movimientoMarcador.current.next({ id, lng, lat });
        });

        
    },[])

    // actualizar ubicacion del marcador
    const actualizaPosicion = useCallback( ({id, lng, lat}) => {
            marcadores.current[id].setLngLat([lng, lat]);
    },[])
    


    useEffect(() => {

        const map = new mapboxgl.Map({
            container: mapaDiv.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [puntoInicial.lng, puntoInicial.lat],
            zoom: puntoInicial.zomm
        });

        mapa.current = map;
    }, [puntoInicial]);


    //Cuando se mueve el mapa
    useEffect(() => {
        mapa.current?.on('move', () => {
            const { lng, lat } = mapa.current.getCenter();
            setCoords({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: mapa.current.getZoom().toFixed(2)
            })
            
        });
    }, [])

    
    //Agregar marcadores en el evento click
    useEffect(() => {
        mapa.current?.on('click', agregarMarcador);
    }, [agregarMarcador])


    return {
        agregarMarcador,
        actualizaPosicion,
        coords,
        marcadores,
        nuevoMarcador$: nuevoMarcador.current,
        movimientoMarcador$: movimientoMarcador.current,
        setRef
    }
}
