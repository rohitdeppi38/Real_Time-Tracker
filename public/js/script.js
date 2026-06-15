const socket = io();

if(navigator.geolocation){
    navigator.geolocation.watchPosition((position)=>{
        console.log(position);
        const {latitude,longitude}= position.coords;
        socket.emit("send-location",{latitude,longitude});
    },(error) => {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.error("User denied location permission");
            break;
        case error.POSITION_UNAVAILABLE:
            console.error("GPS signal unavailable");  // likely your case
            break;
        case error.TIMEOUT:
            console.error("GPS timed out");           // also possible
            break;
    }
},
    {
        enableHighAccuracy:true,
        timeout:30000,
        maximumAge:0,
    }
)
}

const map = L.map("map").setView([0,0],4);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:"OpenStreetMap"
}).addTo(map)

const markers = {};

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }

    // Fit bounds to show every marker
    const allMarkers = Object.values(markers);
    if (allMarkers.length > 1) {
        const group = L.featureGroup(allMarkers);
        map.fitBounds(group.getBounds().pad(0.2));
    } else {
        map.setView([latitude, longitude], 16);
    }
});

socket.on("user-disconnected",(id)=>{
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});

