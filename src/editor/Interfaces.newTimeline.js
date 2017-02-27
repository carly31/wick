var TimelineInterface = function (wickEditor) {

    var self = this;

// Internal state stuff vars

    var lastObject;

// 

    var timeline;

// 

    var cssVars;
    var cssVar;

// Interactions

    var currentInteraction;
    var interactionData;

    var interactions = {};
    interactions['dragFrame'] = {
        'start' : (function (e) {
            
        }), 
        'update' : (function (e) {
            interactionData.frame.elem.style.left = e.x - timeline.framesContainer.elem.getBoundingClientRect().left - cssVar('--frame-width')     /2 + 'px';
            interactionData.frame.elem.style.top  = e.y - timeline.framesContainer.elem.getBoundingClientRect().top  - cssVar('--layer-height')/2 + 'px';
            interactionData.frame.elem.style.zIndex = 10;
        }),
        'finish' : (function (e) {
            var newPlayheadPosition = Math.round(parseInt(interactionData.frame.elem.style.left) / cssVar('--frame-width'));
            var newLayerIndex       = Math.round(parseInt(interactionData.frame.elem.style.top)  / cssVar('--layer-height'));
            var newLayer = wickEditor.project.getCurrentObject().layers[newLayerIndex];
            if(!newLayer) newLayer = wickEditor.project.getCurrentLayer();

            wickEditor.actionHandler.doAction('moveFrame', {
                frame: interactionData.frame.wickFrame, 
                newPlayheadPosition: newPlayheadPosition,
                newLayer: newLayer
            });
        })
    }
    interactions['dragFrameWidth'] = {
        'start' : (function (e) {
            
        }), 
        'update' : (function (e) {
            var wickFrame = interactionData.frame.wickFrame;
            var frameDivLeft = interactionData.frame.elem.getBoundingClientRect().left;
            var mouseLeft = e.x;

            var newWidth = mouseLeft - frameDivLeft;
            //newWidth = roundToNearestN(newWidth, cssVar('--frame-width'));
            interactionData.frame.elem.style.width = + newWidth + 'px';
        }),
        'finish' : (function (e) {
            var newFrameDivLen = parseInt(interactionData.frame.elem.style.width);
            var newLength = Math.round(newFrameDivLen / cssVar('--frame-width'));

            wickEditor.actionHandler.doAction('changeFrameLength', {
                frame: interactionData.frame.wickFrame, 
                newFrameLength: newLength
            });
        })
    }
    interactions['dragSelectionBox'] = {
        'start' : (function (e) {
            var mx = e.x-timeline.framesContainer.elem.getBoundingClientRect().left;
            var my = e.y-timeline.framesContainer.elem.getBoundingClientRect().top;
            interactionData.selectionBoxOrigX = mx;
            interactionData.selectionBoxOrigY = my;
            timeline.framesContainer.selectionBox.elem.style.left = '0px';
            timeline.framesContainer.selectionBox.elem.style.top = '0px';
            timeline.framesContainer.selectionBox.elem.style.width = '0px';
            timeline.framesContainer.selectionBox.elem.style.height = '0px';
        }), 
        'update' : (function (e) {
            var mx = e.x-timeline.framesContainer.elem.getBoundingClientRect().left;
            var my = e.y-timeline.framesContainer.elem.getBoundingClientRect().top;

            var ox = interactionData.selectionBoxOrigX;
            var oy = interactionData.selectionBoxOrigY;

            if(mx-ox > 0) {
                timeline.framesContainer.selectionBox.elem.style.left = ox+'px'
                timeline.framesContainer.selectionBox.elem.style.width = mx-ox+'px';
            } else {
                timeline.framesContainer.selectionBox.elem.style.left = mx+'px';
                timeline.framesContainer.selectionBox.elem.style.width = ox-mx+'px'
            }
            if(my-oy > 0) {
                timeline.framesContainer.selectionBox.elem.style.top = oy+'px'
                timeline.framesContainer.selectionBox.elem.style.height = my-oy+'px';
            } else {
                timeline.framesContainer.selectionBox.elem.style.top = my+'px';
                timeline.framesContainer.selectionBox.elem.style.height = oy-my+'px'
            }

            timeline.framesContainer.selectionBox.elem.style.display = 'block';
        }),
        'finish' : (function (e) {
            timeline.framesContainer.selectionBox.elem.style.display = 'none';

            if(parseInt(timeline.framesContainer.selectionBox.elem.style.width)  === 0 
            && parseInt(timeline.framesContainer.selectionBox.elem.style.height) === 0) return;

            http://stackoverflow.com/questions/2752349/fast-rectangle-to-rectangle-intersection
            function intersectRect(r1, r2) {
              return !(r2.left > r1.right || 
                       r2.right < r1.left || 
                       r2.top > r1.bottom ||
                       r2.bottom < r1.top);
            }

            var frameDivs = document.getElementsByClassName('frame')
            wickEditor.project.clearSelection();
            for(var i = 0; i < frameDivs.length; i ++) {
                var frameDiv = frameDivs[i]

                var frameRect = {
                    left:   parseInt(frameDiv.style.left),
                    top:    parseInt(frameDiv.style.top),
                    right:  parseInt(frameDiv.style.width)  + parseInt(frameDiv.style.left),
                    bottom: parseInt(frameDiv.style.height) + parseInt(frameDiv.style.top)
                }

                var selectionBoxRect = {
                    left:   parseInt(timeline.framesContainer.selectionBox.elem.style.left),
                    top:    parseInt(timeline.framesContainer.selectionBox.elem.style.top),
                    right:  parseInt(timeline.framesContainer.selectionBox.elem.style.width)  + parseInt(timeline.framesContainer.selectionBox.elem.style.left),
                    bottom: parseInt(timeline.framesContainer.selectionBox.elem.style.height) + parseInt(timeline.framesContainer.selectionBox.elem.style.top)
                }

                if(intersectRect(frameRect, selectionBoxRect)) {
                    wickEditor.project.selectObject(frameDiv.wickData.wickFrame);
                } 
            }
            timeline.framesContainer.update();
            timeline.framesContainer.selectionBox.elem.style.width = '0px'
            timeline.framesContainer.selectionBox.elem.style.height = '0px'
        })
    }
    interactions['dragLayer'] = {
        'start' : (function (e) {
            interactionData.allLayerDivs = [];
            interactionData.allLayerDivs.push(interactionData.layer.elem);

            var currentLayer = wickEditor.project.getCurrentLayer();
            timeline.framesContainer.frames.forEach(function (frame) {
                if (frame.wickFrame.parentLayer === currentLayer) {
                    interactionData.allLayerDivs.push(frame.elem)
                }
            });
            timeline.framesContainer.frameStrips.forEach(function (frameStrip) {
                if (frameStrip.wickLayer === currentLayer) {
                    interactionData.allLayerDivs.push(frameStrip.elem)
                }
            });

        }), 
        'update' : (function (e) {
            interactionData.allLayerDivs.forEach(function (div) {
                div.style.top = e.y - timeline.framesContainer.elem.getBoundingClientRect().top - cssVar('--layer-height')/2 + 'px';
            });
        }),
        'finish' : (function (e) {
            var newIndex = Math.round(parseInt(interactionData.allLayerDivs[0].style.top) / cssVar('--layer-height'));
            newIndex = Math.max(newIndex, 0);
            newIndex = Math.min(newIndex, wickEditor.project.currentObject.layers.length-1);

            wickEditor.actionHandler.doAction('moveLayer', {
                layer: interactionData.layer.wickLayer, 
                newIndex: newIndex
            });
        })
    }
    
    var startInteraction = function (interactionName, e, interactiondata) {
        interactionData = interactiondata;
        currentInteraction = interactionName;

        interactions[interactionName]['start'](e);
        //updateInteraction(e);
    }
    var updateInteraction = function (e) {
        if(!currentInteraction) return;
        interactions[currentInteraction]['update'](e);
    }
    var finishInteraction = function (e) {
        if(!currentInteraction) return;
        interactions[currentInteraction]['finish'](e);
        currentInteraction = null;

        timeline.framesContainer.addFrameOverlay.elem.style.display = 'none';
    }

// Div building helper functions

    var Timeline = function () {
        this.elem = null;

        this.layersContainer = new LayersContainer();
        this.framesContainer = new FramesContainer();

        this.build = function () {
            this.elem = document.createElement('div');
            this.elem.className = 'timeline';
            document.getElementById('timelineGUI').appendChild(this.elem);

            this.layersContainer.build();
            this.elem.appendChild(this.layersContainer.elem);

            this.framesContainer.build();
            this.elem.appendChild(this.framesContainer.elem);
            
        }
        
        this.rebuild = function () {
            this.layersContainer.rebuild();
            this.framesContainer.rebuild();
        }

        this.update = function () {
            this.layersContainer.update();
            this.framesContainer.update();
            this.elem.style.height = this.calculateHeight() + "px";
        }

        this.calculateHeight = function () {
            var maxTimelineHeight = cssVar("--max-timeline-height"); 
            var expectedTimelineHeight = this.layersContainer.layers.length * cssVar("--layer-height") + 11; 
            return Math.min(expectedTimelineHeight, maxTimelineHeight); 
        }
    }

    // New Timeline system 

    /* 
    |Timeline
      |Blackdrop 
        |LayerBox
          |FrameBox
            |Lamp
            |FrameStripCell
            |Frame
          |LayerBar
        |Playhead
        |SelectionBox
        |FrameOverlay
    */
         
    var Blackdrop = function () {
        var that = this; 
        this.elem = null; 
        this.layerBoxes = null; 

        this.addFrameOverlay = newAddFrameOverlay(); 
        this.playhead = new Playhead(); 
        this.selectionBox = newSelectionBox(); 

        this.build = function () {
            this.elem = document.createElement('div'); 
            this.elem.className = 'blackdrop'; 
            this.elem.addEventListener('mousedown', function (e) {
                startInteraction('dragSelectionBox', e, {});
                wickEditor.project.clearSelection(); 
                timeline.blackdrop.update(); 
            });

            this.addFrameOverlay.build(); 
            this.playhead.build(); 
            this.selectionBox.build();

            this.rebuild(); 
        }

        this.rebuild = function () {
            this.elem.innerHTML = ""; 
            this.layerBoxes = []; 

            var wickLayers = wickEditor.project.currentObject.layers; 
            wickLayers.forEach(function (wickLayer) {
                var layerBox = new LayerBox(wickLayer);  
                layerBox.build(); 
                that.elem.appendChild(layerBox.elem); 
                that.layerBoxes.push(layerBox); 
            });

        }

        this.update = function () {
            this.playhead.update();
        }

        this.elem.appendChild(this.addFrameOverlay.elem);
        this.elem.appendChild(this.playhead.elem);
        this.elem.appendChild(this.selectionBox.elem);
    }

    var LayerBox = function (wickLayer) {
        var that = this; 

        this.elem = null; 

        this.layerBar = null; 
        this.frameBoxContainer = null; 

        this.wickLayer = wickLayer; 

        this.build = function () {
            this.elem = document.createElement('div'); 
            this.elem.className = 'layer-box'
        }

        this.rebuild = function () {
            this.elem.innerHTML = ""; 
            this.layerBar = new LayerBar(wickLayer); 
            this.frameBoxContainer = new frameBoxContainer(); 

            this.elem.appendChild(this.layerBar.elem);
            this.elem.appendChild(this.frameBoxContainer); 
        }

    }

    var frameBoxContainer = function () {
        var that = this;

        this.elem = null;

        this.frameBoxes = null; 

        this.build = function () {
            this.elem = document.createElement('div');
            this.elem.className = 'frame-box-container';
            this.elem.addEventListener('mousedown', function (e) {
                startInteraction('dragSelectionBox', e, {});
            });

            this.elem.addEventListener('mousedown', function (e) {
                wickEditor.project.clearSelection();
                timeline.framesContainer.update();
            });
            this.rebuild();
        }

        this.rebuild = function () {
            this.elem.innerHTML = "";
            this.frameBoxes = []; 
            this.frames = [];

            var wickLayers = wickEditor.project.currentObject.layers;
            wickLayers.forEach(function (wickLayer) {
                var framesStrip = new FramesStrip();
                framesStrip.wickLayer = wickLayer;
                framesStrip.build();
                framesStrip.wickLayer = wickLayer;
                that.elem.appendChild(framesStrip.elem);
                that.frameStrips.push(framesStrip)

                wickLayer.frames.forEach(function(wickFrame) {
                    var frame = new Frame();

                    frame.wickFrame = wickFrame;
                    frame.wickLayer = wickLayer;
                    frame.build();

                    that.frames.push(frame);
                    that.elem.appendChild(frame.elem);
                });
            });
        }

        this.update = function () {
            this.frames.forEach(function (frame) {
                frame.update();
            });
        }
    }

    var frameBox = function () {
        var that = this;

        this.elem = null; 

        this.lamp = null; 
        this.frameStripCell = null; 
        this.frame = null; 

        this.build = function () {

        }
    }

    var LayerBar = function (wickLayer) {
        var that = this;

        this.elem = null

        this.wickLayer = wickLayer;

        this.build = function () {
            var wickLayers = wickEditor.project.currentObject.layers;

            this.elem = document.createElement('div');
            this.elem.className = "layer-bar";
            this.elem.style.top = (wickLayers.indexOf(this.wickLayer) * cssVar('--layer-height')) + 'px';
            this.elem.innerHTML = this.wickLayer.identifier;
            this.elem.wickData = {wickLayer:this.wickLayer};

            var layerSelectionOverlayDiv = document.createElement('div');
            layerSelectionOverlayDiv.className = 'selection-overlay';
            this.elem.appendChild(layerSelectionOverlayDiv);

            this.elem.addEventListener('mousedown', function (e) {
                wickEditor.actionHandler.doAction('movePlayhead', {
                    obj: wickEditor.project.currentObject,
                    newLayer: that.wickLayer
                });
                startInteraction('dragLayer', e, {layer:that});
            });
        }

        this.update = function () {
            var layerIsSelected = wickEditor.project.getCurrentLayer() === this.wickLayer;
            var selectionOverlayDiv = this.elem.getElementsByClassName('selection-overlay')[0];
            selectionOverlayDiv.style.display = layerIsSelected ? 'block' : 'none';
        }
    }

    var Layer = function () {
        var that = this;

        this.elem = null

        this.wickLayer = null;

        this.build = function () {
            var wickLayers = wickEditor.project.currentObject.layers;

            this.elem = document.createElement('div');
            this.elem.className = "layer";
            this.elem.style.top = (wickLayers.indexOf(this.wickLayer) * cssVar('--layer-height')) + 'px';
            this.elem.innerHTML = this.wickLayer.identifier;
            this.elem.wickData = {wickLayer:this.wickLayer};

            var layerSelectionOverlayDiv = document.createElement('div');
            layerSelectionOverlayDiv.className = 'selection-overlay';
            this.elem.appendChild(layerSelectionOverlayDiv);

            this.elem.addEventListener('mousedown', function (e) {
                wickEditor.actionHandler.doAction('movePlayhead', {
                    obj: wickEditor.project.currentObject,
                    newLayer: that.wickLayer
                });
                startInteraction('dragLayer', e, {layer:that});
            });
        }

        this.update = function () {
            var layerIsSelected = wickEditor.project.getCurrentLayer() === this.wickLayer;
            var selectionOverlayDiv = this.elem.getElementsByClassName('selection-overlay')[0];
            selectionOverlayDiv.style.display = layerIsSelected ? 'block' : 'none';
        }
    }



    var FramesContainer = function () {
        var that = this;

        this.elem = null;

        this.frames = null;
        this.frameStrips = null;

        this.addFrameOverlay = new AddFrameOverlay();
        this.playhead = new Playhead();
        this.selectionBox = new SelectionBox();

        this.build = function () {
            this.elem = document.createElement('div');
            this.elem.className = 'frames-container';
            this.elem.addEventListener('mousedown', function (e) {
                startInteraction('dragSelectionBox', e, {});
            });

            this.elem.addEventListener('mousedown', function (e) {
                wickEditor.project.clearSelection();
                timeline.framesContainer.update();
            });

            this.addFrameOverlay.build();
            this.playhead.build();
            this.selectionBox.build();

            this.rebuild();
        }

        this.rebuild = function () {
            this.elem.innerHTML = "";
            this.frames = [];
            this.frameStrips = [];

            var wickLayers = wickEditor.project.currentObject.layers;
            wickLayers.forEach(function (wickLayer) {
                var framesStrip = new FramesStrip();
                framesStrip.wickLayer = wickLayer;
                framesStrip.build();
                framesStrip.wickLayer = wickLayer;
                that.elem.appendChild(framesStrip.elem);
                that.frameStrips.push(framesStrip)

                wickLayer.frames.forEach(function(wickFrame) {
                    var frame = new Frame();

                    frame.wickFrame = wickFrame;
                    frame.wickLayer = wickLayer;
                    frame.build();

                    that.frames.push(frame);
                    that.elem.appendChild(frame.elem);
                });
            });

            this.elem.appendChild(this.addFrameOverlay.elem);
            this.elem.appendChild(this.playhead.elem);
            this.elem.appendChild(this.selectionBox.elem);
        }

        this.update = function () {
            this.frames.forEach(function (frame) {
                frame.update();
            });
            this.playhead.update();
        }
    }

    var Frame = function () {
        var that = this;

        var selectionOverlayDiv = null;
        var thumbnailDiv = null;

        this.wickFrame = null;
        this.wickLayer = null;

        this.build = function () {
            var wickLayers = wickEditor.project.getCurrentObject().layers;

            this.elem = document.createElement('div');
            this.elem.className = "frame";
            this.elem.style.left = (that.wickFrame.playheadPosition * cssVar('--frame-width')) + 'px';
            this.elem.style.top = (wickLayers.indexOf(that.wickLayer) * cssVar('--layer-height')) + 'px';
            this.elem.style.width = (that.wickFrame.length * cssVar('--frame-width') - cssVar('--common-padding')/2) + 'px';
            this.elem.style.height = cssVar('--layer-height')-cssVar('--common-padding')+'px'
            this.elem.wickData = {wickFrame:that.wickFrame};
            this.elem.addEventListener('mousedown', function (e) {
                wickEditor.actionHandler.doAction('movePlayhead', {
                    obj: wickEditor.project.currentObject,
                    newPlayheadPosition: that.wickFrame.playheadPosition,
                    newLayer: that.wickFrame.parentLayer
                });
                startInteraction("dragFrame", e, {frame:that});
                wickEditor.project.clearSelection();
                wickEditor.project.selectObject(that.wickFrame)
                timeline.framesContainer.update();
                e.stopPropagation();
            });

            thumbnailDiv = document.createElement('img');
            thumbnailDiv.className = "frame-thumbnail";
            this.elem.appendChild(thumbnailDiv);

            selectionOverlayDiv = document.createElement('div');
            selectionOverlayDiv.className = "selection-overlay";
            this.elem.appendChild(selectionOverlayDiv);

            var extenderHandleRight = document.createElement('div');
            extenderHandleRight.className = "frame-extender-handle frame-extender-handle-right";
            extenderHandleRight.addEventListener('mousedown', function (e) {
                startInteraction("dragFrameWidth", e, {frame:that});
                e.stopPropagation();
            });
            this.elem.appendChild(extenderHandleRight);
            
            var extenderHandleLeft = document.createElement('div');
            extenderHandleLeft.className = "frame-extender-handle frame-extender-handle-left";
            extenderHandleLeft.addEventListener('mousedown', function (e) {
                startInteraction("dragFrameWidth", e, {frame:that});
                e.stopPropagation();
            });
            that.elem.appendChild(extenderHandleLeft);
        }

        this.update = function () {
            var src = this.wickFrame.thumbnail;
            if(src) {
                thumbnailDiv.src = src;
            } else {
                thumbnailDiv.src = 'https://www.yireo.com/images/stories/joomla/whitepage.png';
            }

            if (wickEditor.project.isObjectSelected(this.wickFrame)) {
                selectionOverlayDiv.style.display = 'block';
            } else {
                selectionOverlayDiv.style.display = 'none';
            }
        }
    }

    var FramesStrip = function () {
        var that = this;

        this.elem = null;

        this.wickLayer = null;

        this.build = function () {
            var wickLayers = wickEditor.project.getCurrentObject().layers;

            this.elem = document.createElement('div');
            this.elem.className = 'frames-strip';
            this.elem.style.top = (wickLayers.indexOf(this.wickLayer) * cssVar('--layer-height')) + 'px';
            this.elem.addEventListener('mousemove', function (e) {
                var px = Math.round((e.clientX - timeline.framesContainer.elem.getBoundingClientRect().left - cssVar('--frame-width')/2)      / cssVar('--frame-width'))
                var py = Math.round((e.clientY - timeline.framesContainer.elem.getBoundingClientRect().top  - cssVar('--layer-height')/2) / cssVar('--layer-height'))

                if(currentInteraction) return;
                if(wickEditor.project.getCurrentObject().layers[py].getFrameAtPlayheadPosition(px)) return;
                
                timeline.framesContainer.addFrameOverlay.elem.style.display = 'block';
                timeline.framesContainer.addFrameOverlay.elem.style.left = roundToNearestN(e.clientX - timeline.framesContainer.elem.getBoundingClientRect().left - cssVar('--frame-width')/2, cssVar('--frame-width')) + "px";
                timeline.framesContainer.addFrameOverlay.elem.style.top  = roundToNearestN(e.clientY - timeline.framesContainer.elem.getBoundingClientRect().top  - cssVar('--layer-height')/2, cssVar('--layer-height')) + "px";
            });
            this.elem.addEventListener('mouseup', function (e) {
                /*wickEditor.actionHandler.doAction('movePlayhead', {
                    obj: wickEditor.project.currentObject,
                    newPlayheadPosition: Math.round((e.clientX - timeline.framesContainer.elem.getBoundingClientRect().left - cssVar('--frame-width')/2) / cssVar('--frame-width')),
                });*/
                if(timeline.framesContainer.addFrameOverlay.elem.style.display === 'none') return;
                var newFrame = new WickFrame();
                newFrame.playheadPosition = Math.round((e.clientX - timeline.framesContainer.elem.getBoundingClientRect().left - cssVar('--frame-width')/2) / cssVar('--frame-width'))
                var layerIndex = Math.round((e.clientY - timeline.framesContainer.elem.getBoundingClientRect().top - cssVar('--layer-height')/2) / cssVar('--layer-height'))
                var layer = wickEditor.project.currentObject.layers[layerIndex];
                wickEditor.actionHandler.doAction('addFrame', {frame:newFrame, layer:layer});
                timeline.framesContainer.addFrameOverlay.elem.style.display = 'none';
            });
            this.elem.addEventListener('mouseout', function (e) {
                timeline.framesContainer.addFrameOverlay.elem.style.display = 'none';
            });
            for(var i = 0; i < 100; i++) {
                var framesStripCell = document.createElement('div');
                framesStripCell.className = 'frames-strip-cell';
                framesStripCell.style.left = i*cssVar('--frame-width') + 'px';
                this.elem.appendChild(framesStripCell);
            }
        }

        this.update = function () {

        }
    }

    var Playhead = function () {
        this.elem = null;

        this.x = null;

        this.build = function () {
            this.elem = document.createElement('div');
            this.elem.className = 'playhead';
        }

        this.update = function () {
            this.x = wickEditor.project.currentObject.playheadPosition * cssVar('--frame-width') + cssVar('--frame-width')/2 - cssVar('--playhead-width')/2 + 9;
            this.elem.style.left = this.x + 'px';
        }
    }

    var AddFrameOverlay = function () {
        this.elem = null;

        var that = this;

        this.build = function () {
            this.elem = document.createElement('div');
            this.elem.className = 'add-frame-overlay';
            this.elem.style.display = 'none';

            var addFrameOverlayImg = document.createElement('img');
            addFrameOverlayImg.className = 'add-frame-overlay-img';
            addFrameOverlayImg.src = 'http://iconshow.me/media/images/Mixed/Free-Flat-UI-Icons/png/512/plus-24-512.png';
            this.elem.appendChild(addFrameOverlayImg);
        }

        this.update = function () {
            
        }
    }

    var SelectionBox = function () {
        this.elem = null;

        this.build = function () {
            this.elem = document.createElement('div');
            this.elem.className = "selection-box";
            this.elem.style.display = 'none';
        }

        this.update = function () {
            
        }
    }

// Interface API

    self.setup = function () {

        // Load style vars from CSS

        cssVars = window.getComputedStyle(document.body);
        cssVar = function (varName) {
            return parseInt(cssVars.getPropertyValue(varName));
        }

        // Build timeline in DOM

        timeline = new Timeline();
        timeline.build();

        // Setup mouse events for interactions

        currentInteraction = null;
        /*timeline.elem*/window.addEventListener('mousemove', function (e) {
            updateInteraction(e);
        });
        /*timeline.elem*/window.addEventListener('mouseup', function (e) {
            finishInteraction(e);
        });
    }

    self.syncWithEditorState = function () {

        if (lastObject !== wickEditor.project.currentObject || wickEditor.project.currentObject.framesDirty) {
            wickEditor.project.currentObject.framesDirty = false;
            lastObject = wickEditor.project.currentObject;

            timeline.rebuild();
        }

        timeline.update();

    }

}