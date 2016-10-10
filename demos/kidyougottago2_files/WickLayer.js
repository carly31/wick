/* Wick - (c) 2016 Zach Rispoli, Luca Damasco, and Josh Rispoli */

var WickLayer = function () {
	this.frames = [new WickFrame()];
};

WickLayer.prototype.getTotalLength = function () {
	var length = 0;

	for(var i = 0; i < this.frames.length; i++) {
		length += this.frames[i].frameLength;
	}

	return length;
}

WickLayer.prototype.addFrame = function(newFrame) {
    this.frames.push(newFrame);
}

WickLayer.prototype.deleteFrame = function(frame) {
    this.frames.splice(this.frames.indexOf(frame), 1);
}

WickLayer.prototype.copy = function () {

	var copiedLayer = new WickLayer();
	copiedLayer.frames = [];

	this.frames.forEach(function (frame) {
		copiedLayer.frames.push(frame.copy());
	})

	return copiedLayer;

}