var Media =
    {
        getNewsSoundFile: function (NewsTitle) {

            var soundFile = "audio/sound_new.mp3";
            var test = "audio/" + Globals.language + "/" + NewsTitle + ".mp3";
            var res = $.ajax(test, { async: false });
            //var soundFile = "audio/sound_new.mp3";
            //var test = "audio/" + Globals.language + "/" + NewsTitle + ".mp3";
            //$.ajax({
            //    url: test,
            //    type: 'HEAD',
            //    error: function () {
            //        console.log("Sound not exist : " + NewsTitle);
            //        return soundFile;
            //    },
            //    success: function () {
            //        soundFile = test;
            //        return soundFile;
            //    }
            //});
            if (res.statusText == "OK") soundFile = test;
            return soundFile;
        }
    }