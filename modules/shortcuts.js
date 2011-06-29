;(function(modules) {

    var css = ' \
        #lightbox .sc_name { display:block; color:#333; margin-bottom:8px; } \
        #lightbox .sc_key { font-weight:bold; } \
        #lightbox .sc_desc { } \
    \ ';

    modules['shortcuts'] = {
          'author': 'Ibrahim Al-Rajhi'
        , 'name': 'Shortcuts'
        , 'description': 'Make Grooveshark more responsive with keyboard shortcuts.'
        , 'isEnabled': true
        , 'style': { 'css': css, 'getValues': function() { return false; } }
        , 'setup': setup
        , 'construct': construct
        , 'destruct': destruct
    };

    var deletion = {  
          'name': 'Deletion'
        , 's': function() { GS.player.removeSongs(GS.player.currentSong.queueSongID); }
        , 'a': function() { $('#queue_clear_button').click(); }
    };

    var navigation = {
          'name': 'Navigation'
        , 'h': function() { follow('#/'); }
        , 'p': function() { follow($('li.sidebar_playlists a', '#sidebar').attr('href')); }
        , 'm': function() { follow($('li.sidebar_myMusic a', '#sidebar').attr('href')); }
        , 'f': function() { follow($('li.sidebar_favorites a', '#sidebar').attr('href')); }
    };

    var shortcuts = {
          'name': 'Global'
        , '?': function() { if (GS.lightbox.isOpen) { ges.ui.closeLightbox(); } else { ges.ui.openLightbox('shortcuts'); } }
        , 'p': function() { for (var i = 0, j = cleanQuant(); i < j; i++) { $('#player_previous').click(); } }
        , 'n': function() { for (var i = 0, j = cleanQuant(); i < j; i++) { $('#player_next').click(); } }
        , 'v': function() { GS.player.setVolume(this.quantifier); }
        , '>': function() { GS.player.setVolume(GS.player.getVolume() + 10); }
        , '<': function() { GS.player.setVolume(GS.player.getVolume() - 10); }
        , 'm': function() { $('#player_volume').click(); }
        , 's': function() { GS.player.saveQueue(); }
        , 'r': function() { if (GS.player.player.getQueueIsRestorable()) { GS.player.restoreQueue(); } }
        , 'y': function() { GS.player.showVideoLightbox(); }
        , 'S': function() { $('#player_shuffle').click(); }
        , 'F': function() { $('#player_crossfade').click(); }
        , 'L': function() { $('#player_loop').click(); }
        , 'H': function() { GS.player.toggleQueue(); }
        , 'd': deletion
        , 'g': navigation
    };

    var descriptions = {
          '?': 'toggle the help dialogue'
        , 'ds': 'delete current song'
        , 'da': 'delete all songs'
        , 'gh': 'go home'
        , 'gp': 'go to playlists'
        , 'gm': 'go to my music'
        , 'gf': 'go to my favorites'
        , 'p': 'play previous song (takes quantifier)'
        , 'n': 'play next song (takes quantifier)'
        , 'v': 'set volume (takes quantifier)'
        , '>': 'increase volume'
        , '<': 'decrease volume'
        , 'm': 'toggle mute'
        , 's': 'save current queue as a playlist'
        , 'r': 'restore previous queue'
        , 'y': 'open youtube results for current song'
        , 'S': 'toggle shuffle'
        , 'F': 'toggle cross-fade (premium users only)'
        , 'L': 'cycle loop'
        , 'H': 'toggle queue size'
    };

    var router = { 
          'scope': shortcuts
        , 'quantifier': ''
        , 'curChar': ''
        , 'timer': null
    };

    function setup() {
        createHelpBox('Keyboard Shortcuts', createHelpContent());        
    }
    
    function construct() { 
        $('body').bind('keypress', route);
    }

    function destruct() {
        $('body').unbind('keypress', route);
    }

    function follow(hash) {
        window.location.hash = hash;
    }

    function route(evt) {
        if ($('input:focus, textarea:focus').length > 0) { return; }

        removeTimer();
        router.curChar = String.fromCharCode(evt.keyCode);
        var isNumber = !isNaN(parseInt(router.curChar));

        if (isNumber) {
            router.quantifier += router.curChar;
        } 
        else if (typeof router.scope[router.curChar] === 'object') {
            router.scope = router.scope[router.curChar];
        }
        else if (typeof router.scope[router.curChar] === 'function') {
            callShortcut();
        }
        else {
            reset();
        }

        setTimer();
        console.log('char:', router.curChar, 'quantifier:', router.quantifier, 'scope:', router.scope, 'timer:', router.timer);
    } 

    function reset() {
        router.scope = shortcuts;
        router.quantifier = '';
        router.timer = null;
    }

    function cleanQuant() { 
        var quantifier = parseInt(router.quantifier);
        if (isNaN(quantifier)) { return 1; }
        return quantifier;
    }

    function callShortcut() {
        var shortcut = router.scope[router.curChar];
        if (typeof shortcut === 'function') {
            shortcut.call(router);
            reset();
        }
    }

    function setTimer() {
        if (!router.timer) {
            router.timer = setTimeout(reset, 3e3);
        }
    }

    function removeTimer() {
        if (router.timer) {
            clearTimeout(router.timer);
            router.timer = null;
        }
    }

    function createHelpBox(title, content) {
        var options = {
              'title': title
            , 'content': content
            , 'buttons': [
                { 
                      'label': 'Contribute Code'
                    , 'link': 'http://github.com/theabraham/Grooveshark-Enhancement-Suite/'
                    , 'pos': 'right'
                }
            ]
            , 'onpopup': function() { }
        };

        ges.ui.createLightbox('shortcuts', options);              
    }

    function createHelpContent() {
        var content = '';
        var shortcutTemplate = $('<div><span class="sc_key"></span> <span class="sc_desc"></span><br/></div>');
        content = traverseShortcuts(shortcuts, '', content, shortcutTemplate);
        return content;
    }

    function traverseShortcuts(scope, parentKey, content, template) {
        var shortcutTag;

        _.forEach(scope, function(shortcut, key) {
            if (typeof shortcut === 'object') { 
                content = traverseShortcuts(scope[key], parentKey + key, content, template); 
            }
            else if (typeof shortcut === 'string') {
                content += '</p><p><span class="sc_name">' + shortcut + '</span>';
            }
            else {
                shortcutTag = $(template).clone();
                $('.sc_key', shortcutTag).html(parentKey + key);
                $('.sc_desc', shortcutTag).html(descriptions[parentKey + key]);
                content += $(shortcutTag).html();
            }
        });

        content += '</p>';
        return content;
    }

})(ges.modules.modules);