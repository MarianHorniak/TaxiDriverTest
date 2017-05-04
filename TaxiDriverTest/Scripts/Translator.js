var Translator = 
    {
        Translate: function (originalText, Language)
        {
            if (!Language) Language = Globals.language;
            return Translator.TranslateComplete(originalText, Language);
        },
        

        TranslateComplete: function (originalText, Language)
        {
            return originalText;
        }



    }

