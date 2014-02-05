var Geo =
    {
        getDistanceFromLatLonInKm: function (lat1, lon1, lat2, lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = Geo.deg2rad(lat2 - lat1);  // deg2rad below
            var dLon = Geo.deg2rad(lon2 - lon1);
            var a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(Geo.deg2rad(lat1)) * Math.cos(Geo.deg2rad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c; // Distance in km
            d = Math.round(d * 1000) / 1000;
            

            return d;
        },

        deg2rad: function (deg) {
            return deg * (Math.PI / 180)
        }

    }