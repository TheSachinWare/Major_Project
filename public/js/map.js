// mapToken = mapToken;
// console.log(mapToken);
mapboxgl.accessToken = mapToken; 

const map = new mapboxgl.Map({
    container : 'map', //container ID.
    style : 'mapbox://styles/mapbox/streets-v12',//style URL. //dark-v11.
    center : listing.geometry.coordinates,// starting position [lng, lat].
    zoom : 9
});

console.log(listing.geometry.coordinates);

const marker = new mapboxgl.Marker( { color : "red" })
    .setLngLat(listing.geometry.coordinates)
    .setPopup( 
        new mapboxgl.Popup ({
            offset : 25, 
        })
        .setHTML(`<h4>${listing.title}</h4> <p>Exact location will be provided after booking.</p>`)
    )
    .addTo(map);