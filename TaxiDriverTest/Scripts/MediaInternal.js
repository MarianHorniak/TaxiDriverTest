var MediaInternal =
    {

        defaultNewsSoundfile: "audio/sound_new.mp3",

        SOUND_TYPE : {
            Order_Change: { value: 0, filename: "sound_order.mp3", haslocalization: true },
            Order_Broadcast: { value: 1, filename: "sound_orderbroadcast.mp3", haslocalization: true },
            Message_New: { value: 2, filename: "sound_message.mp3", haslocalization: true },
            SetPayment: { value: 3, filename: "SetPayment.mp3", haslocalization: true },
            StandAvailable: { value: 4, filename: "StandAvailable.mp3", haslocalization: true },
            StandLeave: { value: 5, filename: "StandLeave.mp3", haslocalization: true }
        },

        ///sounfilealias - alias suboru alebo priamo subor !
        playSoundInMedia: function (soundFile, isAlias, isLocalized) {


            //no file ? 
            if (!soundFile) {
                app.log("no file to play");
                return;
            }

            //default zvuk
            var realSoundFile = MediaInternal.defaultNewsSoundfile;

            //ak je to alias, tak ho prekodujeme
            if (isAlias && isAlias == 1) {
                realSoundFile = Globals.soundItems[soundFile];
            }
            if (isLocalized && isLocalized == 1) {
                realSoundFile = Globals.language + "/" + realSoundFile;
            }



            //no file ? 
            if (!realSoundFile) {
                app.log("no real file to play : " + soundFileAlias);
                return;
            }

            window.setTimeout(function () {
                if (realSoundFile) {
                    var toplay;
                    if (app.isDevice) {

                        var file = app.getPhoneGapPath() + "audio/" + realSoundFile;
                        toplay = new Media(file);

                    }
                    else {
                        toplay = new Audio("audio/" + realSoundFile);
                    }

                    //toplay sound initialized ? 
                    if (toplay) {

                        if (toplay.setVolume)
                            toplay.setVolume(Globals.Media_Volume);
                        else
                            toplay.volume = Globals.Media_Volume;

                        toplay.play();
                        
                    }
                }
            }, 1);

        },

        mediaError: function (e) {
            app.log('mediaError', e);
        },

        mediaStatus: function (status) {
            app.log('mediaStatus '+status);
            if (status === Media.MEDIA_STOPPED) {
               // media.seekTo(0);
               // media.play();
            }
        }

    }
    