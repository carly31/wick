var PanTool = function (wickEditor) {

    var that = this;

    var canvas = wickEditor.interfaces['fabric'].canvas;

    this.getCursorImage = function () {
        return "move";
    }

    var panning = false;
    canvas.on('mouse:up', function (e) {
        panning = false;
        canvas.selection = true;
    });

    canvas.on('mouse:down', function (e) {
        if(wickEditor.inputHandler.keys[32] || wickEditor.currentTool instanceof PanTool) {
            panning = true;
            canvas.selection = false;
        }
    });
    canvas.on('mouse:move', function (e) {
        if (panning && e && e.e) {
            var delta = new fabric.Point(e.e.movementX, e.e.movementY);
            canvas.relativePan(delta);

            wickEditor.interfaces['fabric'].inactiveFrame.left -= delta.x;
            wickEditor.interfaces['fabric'].inactiveFrame.top -= delta.y;
            wickEditor.interfaces['fabric'].inactiveFrame.setCoords();
        }
    });

}