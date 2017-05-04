//https://github.com/mapsplugin/cordova-plugin-googlemaps
//!!!https://github.com/dpa99c/phonegap-launch-navigator

var Navigator = {
    navigate: function (toPoint) {
        if (window.launchnavigator)
            window.launchnavigator.navigate(toPoint);
    },
    navigateStart: function (order) {
        if (!order)
            return;
        if (order.StartLatitude && order.StartLongitude)
            this.navigate([order.StartLatitude, order.StartLongitude]);
        else
            this.navigate(order.StartCity + " " + order.StartAddress);
    },
    navigateEnd: function (order) {
        if (!order)
            return;
        this.navigate(order.EndCity + " " + order.EndAddress);
    }
}