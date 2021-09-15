import React, {useEffect, useContext} from 'react'

import { SocketContext } from '../context/SocketContext';

import { useMapbox } from '../hooks/useMapbox';

const puntoInicial = {
    lng: -122.4736,
    lat: 37.8127,
    zomm: 2
}


export const MapaPage = () => {

    const { setRef, coords, nuevoMarcador$, movimientoMarcador$, agregarMarcador, actualizaPosicion } = useMapbox(puntoInicial);
    const {socket} = useContext(SocketContext);

    // escuchar los marcadores existentes
    useEffect(() => {

        socket.on('marcadores-activos', (marcadores) => {

            for( const key of Object.keys(marcadores)){
                agregarMarcador(marcadores[key], key);
            }
            
        })
    }, [socket, agregarMarcador])

    // nuevo marcador
    useEffect(() => {
        nuevoMarcador$.subscribe(marcador => {
            socket.emit('marcador-nuevo', marcador);
        });
    }, [nuevoMarcador$, socket]);

    //Movimiento del marcador 
    useEffect(() => {
        movimientoMarcador$.subscribe(marcador => {
           socket.emit('marcador-actualizado', marcador);
        });
    }, [socket,movimientoMarcador$]);

    //Mover marcador mediante sockets
    useEffect(() => {
        socket.on('marcador-actualizado', (marcador) => {
            actualizaPosicion(marcador);
        })
    }, [socket, actualizaPosicion])

    //Escuchar nuevos marcadores
    useEffect(() => {
        socket.on('marcador-nuevo', (marcador) => {
            agregarMarcador(marcador, marcador.id);
        });
    }, [socket, agregarMarcador])


    return (
        <>
            <div className="info">Lng: {coords.lng}, lat: {coords.lat}, zoom: {coords.zomm}</div>
            <div
                ref= {setRef}
                className="mapcontainer"
            />
        </>
    )
}
