import React, { useState, useCallback } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'


const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const containerStyle = {
  width: '100%',
  height: '400px',
}

const center = {
  lat: 37.7749, // Example coordinates (San Francisco)
  lng: -122.4194,
}

const OfficeMap = () => {
  const [selected, setSelected] = useState<any>(null)

  const onSelect = useCallback((marker: any) => {
    setSelected(marker)
  }, [])

  return (
    <LoadScript googleMapsApiKey={apiKey!}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
      >
        <Marker
          position={center}
          onClick={() => onSelect(center)}
        />
        {selected ? (
          <InfoWindow
            position={selected}
            onCloseClick={() => setSelected(null)}
          >
            <div>
              <h3>Our Office</h3>
              <p>Visit us here!</p>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </LoadScript>
  )
}

export default OfficeMap

