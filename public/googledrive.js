function checkAuth(showDialog) {
    const signedIn = gapi.auth2.getAuthInstance().isSignedIn.get()
    if (!signedIn && showDialog)
        return gapi.auth2.getAuthInstance().signIn();
    return Promise.resolve(signedIn)
}

function saveFile(contentToSave, mapId, fileName, paramContentType) {
    const googleId = toGoogleFileId(mapId);
    return new Promise((resolve, reject) => {
        boundary = '-------314159265358979323846',
        delimiter = '\r\n--' + boundary + '\r\n',
        closeDelim = '\r\n--' + boundary + '--',
        contentType = paramContentType || defaultContentType,
        metadata = {
        'title': fileName,
        'mimeType': contentType
        };
    if (fileMetaData)
        metadata = $.extend(metadata,fileMetaData);

    const multipartRequestBody = delimiter +
        'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter +
        'Content-Type: ' + contentType + '\r\n' + '\r\n' + contentToSave + closeDelim;
    const request = gapi.client.request({
        'path': '/upload/drive/v2/files' + (googleId ? '/' + googleId : ''),
        'method': (googleId ? 'PUT' : 'POST'),
        'params': {
            'uploadType': 'multipart',
            'useContentAsIndexableText': (contentToSave.length < 131072)
        },
        /* google refuses indexable text larger than 128k, see https://developers.google.com/drive/file */
        'headers': {
            'Content-Type': 'multipart/mixed; boundary=\'' + boundary + '\''
        },
        'body': multipartRequestBody
    });

    try {
        request.execute(function(resp) {
        const retriable = [404, 500, 502, 503, 504, -1];
        if (resp.error) {
            if (resp.error.code === 403) {
            if (resp.error.reason && (resp.error.reason === 'rateLimitExceeded' || resp.error.reason === 'userRateLimitExceeded')) {
                reject('network-error');
            } else {
                reject('no-access-allowed');
            }
            } else if (resp.error.code === 401) {
                return checkAuth(false).then(() =>
                    saveFile(contentToSave, mapId, fileName, paramContentType))
            } else if (_.contains(retriable, resp.error.code)) {
                reject('network-error');
            } else {
                reject(resp.error);
            }
        } else {
            resolve(mindMupId(resp.id), properties);
        }
        });
    } catch (e) {
        reject('network-error', e.toString() + '\nstack: ' + e.stack + '\nauth: ' + JSON.stringify(gapi.auth.getToken()) + '\nnow: ' + Date.now());
    }
  })
}

function loadFile(fileId) {
    return new Promise((resolve,reject) => {
        const request = gapi.client.drive.files.get({ 'fileId': fileId });
        request.execute(resp => {
            if (resp.error) {
                if (resp.error.code === 403) {
                    reject('network-error');
                } else if (resp.error.code === 404) {
                    reject('no-access-allowed');
                } else {
                    reject(resp.error);
                }
            } else {
                return downloadFile(resp).then(content => resolve(content, resp))
            }
        })
    })
}
  
function loadMap(mapId, showAuthenticationDialogs) {
    return checkAuth(showAuthenticationDialogs).then( () =>
        loadFile(toGoogleFileId(mapId)))
}
  
function saveMap(contentToSave, mapId, fileName, paramContentType, showAuthenticationDialogs) {
    return checkAuth(showAuthenticationDialogs).then( () =>
            saveFile(contentToSave, mapId, fileName, paramContentType))
}

function showSharingSettings(mindMupId1) {
    const showDialog = function() {
        const shareClient = new gapi.drive.share.ShareClient(driveSettings.appId);
        shareClient.setItemIds(toGoogleFileId(mindMupId1));
        shareClient.showSettingsDialog();
    };
    if (gapi && gapi.drive && gapi.drive.share) {
        showDialog();
    } else {
        this.ready(false).done(function() {
        gapi.load('drive-share', showDialog);
        });
    }
}
   
// activation

/* Opens doc - creates a new document if no id in the url*/
  
function openGoogleDriveDoc() {
    const state = JSON.parse(getURLParameter('state'));
    if (!state || !state.ids)
      return
    const mapId = state.ids[0];
    return loadMap(mapId, true).then((content, resp) => ({
        content: content,
        title: resp.title,
        resp: resp,
        save() {
          const paramContentType = '';
          return saveMap(this.content, mapId, this.title, paramContentType, false);
        },
        showSharingSettings() {
          showSharingSettings(mindMupId(this.resp.id));
        }
      }), error => console.log(error))
}


function mindMupId(googleId) {
    return 'g1' + (googleId || '');
}
  
  
  

  