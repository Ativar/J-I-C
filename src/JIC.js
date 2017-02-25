/*!
 * JIC JavaScript Library v2.0.2
 * https://github.com/brunobar79/J-I-C/
 *
 * Copyright 2016, Bruno Barbieri
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: Tue Jul 11 13:13:03 2016 -0400
 */

/**
 * Create the jic object.
 * @constructor
 */

var jic = {
  /**
   * Receives an Image Object (can be JPG OR PNG) and returns a new Image Object compressed
   * @param {Image} sourceImgObj The source Image Object
   * @param {Integer} quality The output quality of Image Object
   * @param {String} output format. Possible values are jpg and png
   * @return {Image} resultImageObj The compressed Image Object
   */

  compress: function (sourceImgObj, quality, outputFormat) {
    var mimeType = 'image/jpeg'
    if (typeof outputFormat !== 'undefined' && outputFormat === 'png') {
      mimeType = 'image/png'
    }


    var cvs = document.createElement('canvas')
    cvs.width = sourceImgObj.naturalWidth
    cvs.height = sourceImgObj.naturalHeight
    var ctx = cvs.getContext('2d').drawImage(sourceImgObj, 0, 0)
    var newImageData = cvs.toDataURL(mimeType, quality / 100)
    var resultImageObj = new Image()
    resultImageObj.src = newImageData
    return resultImageObj
  },

  /**
   * Receives an Image Object and upload it to the server via ajax
   * @param {Image} compressedImgObj The Compressed Image Object
   * @param {String} The server side url to send the POST request
   * @param {String} fileInputName The name of the input that the server will receive with the file
   * @param {String} filename The name of the file that will be sent to the server
   * @param {function} successCallback The callback to trigger when the upload is succesful.
   * @param {function} (OPTIONAL) errorCallback The callback to trigger when the upload failed.
	     * @param {function} (OPTIONAL) duringCallback The callback called to be notified about the image's upload progress.
	     * @param {Object} (OPTIONAL) customHeaders An object representing key-value  properties to inject to the request header.
   */

  upload: function (compressedImgObj, uploadUrl, fileInputName, filename, successCallback, errorCallback, duringCallback, customHeaders) {
    // ADD sendAsBinary compatibilty to older browsers
    if (XMLHttpRequest.prototype.sendAsBinary === undefined) {
      XMLHttpRequest.prototype.sendAsBinary = function (string) {
        var bytes = Array.prototype.map.call(string, function (c) {
          return c.charCodeAt(0) & 0xff
        })
        this.send(new Uint8Array(bytes).buffer)
      }
    }

    var type = 'image/jpeg'
    if (filename.substr(-4).toLowerCase() === '.png') {
      type = 'image/png'
    }

    var data = compressedImgObj.src
    data = data.replace('data:' + type + ';base64,', '')

    var xhr = new XMLHttpRequest()
    xhr.open('POST', uploadUrl, true)
    var boundary = 'someboundary'

    xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary)

    // Set custom request headers if customHeaders parameter is provided
    if (customHeaders && typeof customHeaders === 'object') {
      for (var headerKey in customHeaders) {
        xhr.setRequestHeader(headerKey, customHeaders[headerKey])
      }
    }

    // If a duringCallback function is set as a parameter, call that to notify about the upload progress
    if (duringCallback && duringCallback instanceof Function) {
      xhr.upload.onprogress = function (evt) {
        if (evt.lengthComputable) {
          duringCallback((evt.loaded / evt.total) * 100)
        }
      }
    }

    xhr.sendAsBinary(['--' + boundary, 'Content-Disposition: form-data; name="' + fileInputName + '"; filename="' + filename + '"', 'Content-Type: ' + type, '', atob(data), '--' + boundary + '--'].join('\r\n'))

    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          successCallback(this.responseText)
        } else if (this.status >= 400) {
          if (errorCallback && errorCallback instanceof Function) {
            errorCallback(this.responseText)
          }
        }
      }
    }
  }
}

module.exports = jic
