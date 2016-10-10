/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickFrame = function () {
	// Identifier so we can do e.g. gotoAndStop("menu") 
	this.identifier = null;

	// Store all objects in frame. 
	this.wickObjects = [];

	// Create multiframe support. 
	this.frameLength = 1;

	// Should we stop when we get to this frame?
	this.autoplay = true;
};

// Extend our frame to encompass more frames. 
WickFrame.prototype.extend = function(length) {
	this.frameLength += length; 
}

// Reduce the number of frames this WickFrame Occupies. 
WickFrame.prototype.shrink = function(length) {
	// Never "shrink" by a negative amount. 
	if (length <= 0) {
		return;
	}

	originalLength = this.frameLength; 
	this.frameLength -= length; 

	// determine and return the actual change in frames. 
	if (this.frameLength <= 0) {
		this.frameLength = 1;
		return originalLength - 1; 
	} else {
		return length; 
	}
}

WickFrame.prototype.copy = function () {

	var copiedFrame = new WickFrame();

	copiedFrame.identifier = this.identifier;
	copiedFrame.frameLength = this.frameLength;
	copiedFrame.autoplay = this.autoplay;

	this.wickObjects.forEach(function (wickObject) {
		copiedFrame.wickObjects.push(wickObject.copy());
	})

	return copiedFrame;

}