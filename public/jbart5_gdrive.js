function loadFromCdn(file,v) {
    const src = `//unpkg.com/jbart5-react${v}/${file}`
    if (file.match(/\.js$/))
        document.write(`<script type="text/javascript" src="${src}">`+'</sc'+'ript>')
    if (file.match(/\.css$/))
        document.write(`<link rel="stylesheet" type="text/css" href="${src}"/>`)
}

function getURLParameter(name) {
    const out = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1];
    return out && decodeURI(out);
}

const jbart5_app = {
    name: 'jbart',
    appId: '224510070990',
    clientId: '224510070990-uvr679v77cv94tc9gohnligft73umstg.apps.googleusercontent.com',
    apiKey: 'AIzaSyDO6SKtVK28LK0WZSmhT5WF9raAv93sGLI',
    mimeType: 'application/jbart',
    installScopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.install', 'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/drive.appdata'].join(' '),
    redirect_uri: 'https://jbart5.appspot.com/oauth2callback_jbart.html',
    newDocumentTitle: 'jBart Widget',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    fileMetaData: {
      kind: 'drive#file',
      iconLink: '//jbartlib.appspot.com/images/studio/favicon.png',
      thumbnailLink: '//jbartlib.appspot.com/images/studio/favicon.png',
      defaultOpenWithLink: 'https://jbart5.appspot.com/studio.html',
      alternateLink: 'https://jbart5.appspot.com/studio.html',
      description: 'jBart Widget',
      fileExtension: 'jbart'
    },
    newDocument: `jb.component('blank', {
    type: 'control',
    impl: group({
        controls: label('hello world')
    })
})`
      
}

jb_gae = {
    init: () => new Promise((resolve,reject) => {
        window.handleClientLoad = function() {
            // Load the API client and auth2 library
            gapi.load('client:auth2', () => {
                gapi.client.init({
                    apiKey: jbart5_app.apiKey,
                    discoveryDocs: jbart5_app.discoveryDocs,
                    clientId: jbart5_app.clientId,
                    scope: jbart5_app.installScopes
                }).then(resolve,reject)
            })
        }
        document.write(`<script async defer src="https://apis.google.com/js/api.js" 
        onload="this.onload=function(){};handleClientLoad()" 
        onreadystatechange="if (this.readyState === 'complete') this.onload()">
        </script>    
    `)}),
    loadStudio() {
        //const v = '' //(RegExp('studioversion=(.+?)(&|$)').exec(location.href)||[])[1] || '';
        // loadFromCdn('bin/studio/studio-all.js',v);
        // loadFromCdn('bin/studio/studio-all.css',v);
        jb.ui.render(jb.ui.h(new jb.jbCtx().run({$:'studio.all'}).reactComp()), document.getElementById('studio'))
    }
}
