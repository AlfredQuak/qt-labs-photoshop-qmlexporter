/*
Photoshop to QML Exporter

Version: 0.5

For information about Qt Quick itself:
http://qt-project.org/doc/qt-5.0/qtquick/qtquick-index.html

Authors: Jens Bache-Wiig, William Hallatt
contact: jens.bache-wiig@digia.com

Copyright (c) 2015 Digia Plc and/or its subsidiary(-ies).

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. All advertising materials mentioning features or use of this software
   must display the following acknowledgement:
   This product includes software developed by the <organization>.
4. Neither the name of the <organization> nor the
   names of its contributors may be used to endorse or promote products
   derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

#target photoshop

var exportInfo
var progressPanel
var runButton = 1
var cancelButton = 2
var qmlfile
var layerCount = 0
var layerIndex = 0
var cancelExport = 0

// Setting keys
var appString = "QML Exporter - 1"
var outputNameKey = 0;
var destinationKey = 1;
var rasterizeKey = 2;
var exportByGroupKey = 3;
var exportHiddenKey = 4;
var exportQMLKey = 5;

Array.prototype.indexOf = function(elt /*, from*/) {
    var from = Number(arguments[1]) || 0;
    from = (from < 0) ? Math.ceil(from) : Math.floor(from);

    var len = this.length;
    if (from < 0) from += len;

    for (; from < len; from++) {
        if (from in this &&
                this[from] === elt) {
            return from;
        }
    }
    return -1;
};

main();

function hexValue(dec)
{
    var result;
    switch (dec) {
        case 10:
            result = "a";
            break;
        case 11:
            result = "b"
            break;
        case 12:
            result = "c";
            break;
        case 13:
            result = "d";
            break;
        case 14:
            result = "e"
        case 15:
            result = "f"
            break;
        default:
            result = dec
            break;
    }
    return result;
}

// Converts SolidColor to a QML color property.
function qtColor(color) {
    var r = Math.floor(color.rgb.red)
    var g = Math.floor(color.rgb.green);
    var b = Math.floor(color.rgb.blue)
    var a = Math.floor(color.rgb.alpha * 255)
    var v1 = hexValue(Math.floor(r / 16));
    var v2 = hexValue(r % 16);
    var v3 = hexValue(Math.floor(g / 16));
    var v4 = hexValue(g % 16);
    var v5 = hexValue(Math.floor(b / 16));
    var v6 = hexValue(b % 16);
    if (a > 0) {
        var v7 = hexValue(Math.floor(a / 16));
        var v8 = hexValue(a % 16);
        return  "\"#" + v1 + v2 + v3 + v4 + v5 + v6 + v7 + v8 + "\"";
    }
    return  "\"#" + v1 + v2 + v3 + v4 + v5 + v6 + "\"";
}

function createProgressBar() {
    var myMaximumValue = 1.0;
    var myProgressBarWidth = 300;
    progressPanel = new Window('palette', 'Exporting document to QML...');
    progressPanel.myProgressBar = progressPanel.add('progressbar',
        [12, 12, myProgressBarWidth, 24], 0, myMaximumValue);

    progressPanel.buttonCancel = progressPanel .add("button", undefined, "Cancel");
    progressPanel.buttonCancel.onClick = function () {
        cancelExport = true;
        progressPanel.hide();
    }
    progressPanel.show();
}

// Opens the output QML file and writes the initial "Item" tag.
function openQMLFile() {
    if(exportInfo.exportQML) {
        var elementName = exportInfo.outputName;
        if (elementName.indexOf(".qml") == -1) {	// Append .qml unless not explicitly set
            elementName += ".qml"
        }
        var outputName = exportInfo.destination + "/" + elementName;
        qmlfile = new File(outputName);
        qmlfile.encoding = "UTF8";
        qmlfile.open("w", "TEXT", "");
        qmlfile.write("import Qt 4.7\n");
        qmlfile.write("Item {\n");
        qmlfile.write("    width:" + app.activeDocument.width.as("px") + "\n");
        qmlfile.write("    height:" + app.activeDocument.height.as("px") + "\n");
    }
}

// Closes the "Item" tag and the QML file.
function closeQMLFile() {
    if(exportInfo.exportQML) {
        qmlfile.write("}\n");
        qmlfile.close();
    }
}

// Creates and sets up the script's dialog and
// populates "exportInfo" with user input.
function setupDialog(exportInfo) {
    var mainDialog = new Window("dialog", "Export Document To QML");
    var brush = mainDialog.graphics.newBrush(mainDialog.graphics.BrushType.THEME_COLOR, "appDialogBackground");
    mainDialog.graphics.backgroundColor = brush;
    mainDialog.graphics.disabledBackgroundColor = mainDialog.graphics.backgroundColor;
    mainDialog.orientation = 'column';
    mainDialog.alignChildren = 'left';

    // "Element Name".
    mainDialog.groupFirstLine = mainDialog.add("group");
    mainDialog.groupFirstLine.orientation = 'row';
    mainDialog.groupFirstLine.alignChildren = 'left';
    mainDialog.groupFirstLine.alignment = 'fill';

    mainDialog.groupFirstLine.add("statictext", undefined, "Element Name:");
    mainDialog.outputName = mainDialog.groupFirstLine.add("edittext", undefined, "MyElement");
    mainDialog.outputName.preferredSize.width = 220

    // "Output Folder".
    mainDialog.groupSecondLine = mainDialog.add("group");
    mainDialog.groupSecondLine.orientation = 'row';
    mainDialog.groupSecondLine.alignChildren = 'left';

    mainDialog.groupSecondLine.add("statictext", undefined, "Output Folder:");
    mainDialog.destinationFolder = mainDialog.groupSecondLine.add("edittext", undefined, "");
    mainDialog.destinationFolder.preferredSize.width = 220;
    mainDialog.buttonBrowse = mainDialog.groupSecondLine.add("button", undefined, "Browse..");

    // Checkboxes.
    mainDialog.groupThirdLine = mainDialog.add("group");
    mainDialog.groupThirdLine.orientation = 'row';
    mainDialog.groupThirdLine.alignChildren = 'right';
    mainDialog.groupThirdLine.alignment = 'right';

    mainDialog.rasterizeText = mainDialog.groupThirdLine.add("checkbox", undefined, "Rasterize Text");
    mainDialog.exportByGroup = mainDialog.groupThirdLine.add("checkbox", undefined, "Group layers");
    mainDialog.exportHidden = mainDialog.groupThirdLine.add("checkbox", undefined, "Export hidden");
    mainDialog.exportQML = mainDialog.groupThirdLine.add("checkbox", undefined, "Export QML");

    // Dialog buttons.
    mainDialog.groupFourthLine = mainDialog.add("group");
    mainDialog.groupFourthLine.orientation = 'row';
    mainDialog.groupFourthLine.alignChildren = 'right';
    mainDialog.groupFourthLine.alignment = 'right';

    mainDialog.buttonRun = mainDialog.groupFourthLine .add("button", undefined, "Export");
    mainDialog.defaultElement = mainDialog.buttonRun

    // Button actions.
    mainDialog.buttonBrowse.onClick = function () {
        var defaultFolder = defaultFolder = "~";
        var selFolder = Folder.selectDialog("Select destination", defaultFolder);
        if (selFolder != null) {
            mainDialog.destinationFolder.text = selFolder.fsName;
        }
    }

    mainDialog.buttonRun.onClick = function () {
        var destination = mainDialog.destinationFolder.text;
        if (destination.length == 0) {
            alert("You must specify a destination directory.");
            return;
        }

        var testFolder = new Folder(destination);
        if (!testFolder.exists) {
            alert("The destination directory does not exist.");
            return;
        }
        mainDialog.close(runButton);
    }

    mainDialog.buttonCancel = mainDialog.groupFourthLine .add("button", undefined, "Cancel");
    mainDialog.buttonCancel.onClick = function () {
        mainDialog.close(cancelButton);
    }

    try {
        // Try to read saved settings
        var desc = app.getCustomOptions(appString);
        mainDialog.outputName.text = desc.getString(outputNameKey);
        mainDialog.destinationFolder.text = desc.getString(destinationKey);
        mainDialog.rasterizeText.value = desc.getBoolean(rasterizeKey);
        mainDialog.exportByGroup.value = desc.getBoolean(exportByGroupKey);
        mainDialog.exportHidden.value = desc.getBoolean(exportHiddenKey);
        mainDialog.exportQML.value = desc.getBoolean(exportQMLKey);
    }
    catch(e) {
        // Default settings on first run
        mainDialog.rasterizeText.value = false;
        mainDialog.exportByGroup.value = true;
        mainDialog.exportHidden.value = false;
        mainDialog.exportQML.value = true;
    } // Use defaults

    app.bringToFront();
    mainDialog.defaultElement.active = true;
    mainDialog.center();

    var result = mainDialog.show();
    if (cancelButton != result) {
        var desc = new ActionDescriptor();
        desc.putString(outputNameKey, mainDialog.outputName.text);
        desc.putString(destinationKey, mainDialog.destinationFolder.text);
        desc.putBoolean(rasterizeKey, mainDialog.rasterizeText.value);
        desc.putBoolean(exportByGroupKey, mainDialog.exportByGroup.value);
        desc.putBoolean(exportHiddenKey, mainDialog.exportHidden.value);
        desc.putBoolean(exportQMLKey, mainDialog.exportQML.value);
        app.putCustomOptions(appString, desc);

        // Populate exportInfo object.
        exportInfo.outputName = mainDialog.outputName.text;
        exportInfo.destination = mainDialog.destinationFolder.text;
        exportInfo.exportQML = mainDialog.exportQML.value;
        exportInfo.exportByGroup = mainDialog.exportByGroup.value;
        exportInfo.exportHidden = mainDialog.exportHidden.value;
        exportInfo.rasterizeText = mainDialog.rasterizeText.value;
    }
    return result;
}

// Recursively counts all the layers in the active document.
function countLayers(obj) {
    // Even when grouping layers, we export all layers at depth == 0.
    for (var i = 0; i < obj.artLayers.length; i++) {
        layerCount++;
    }
    for (var i = 0; i < obj.layerSets.length; i++) { // Recursive
        if (!exportInfo.exportByGroup) {
            countLayers(obj.layerSets[i]);
        }
        layerCount++;
    }
}

// Recursively hides (sets invisible) all layers in the active document.
function hideAll(obj) {
    for (var i = 0; i < obj.artLayers.length; i++) {
        obj.artLayers[i].allLocked = false;
        obj.artLayers[i].visible = false;
    }
    for (var i = 0; i < obj.layerSets.length; i++) { // Recursive
        hideAll(obj.layerSets[i]);
    }
}

function writeQMLProperties(isText, visible, opacity, currentLayer, id, filename) {
    if (isText) qmlfile.write("    Text {\n");
    else qmlfile.write("    Image {\n");
    qmlfile.write("        id: " + id + "\n");
    if (!visible) qmlfile.write("        visible: " + visible+ "\n");

    var xoffset = currentLayer.bounds[0].as("px");
    var yoffset = currentLayer.bounds[1].as("px");

    if (isText) {
        var textItem = currentLayer.textItem;

        // ### Temporary hack to set font positioning
        // Using pointsize doesnt work for some reason and we need to
        // figure out which metric we need to use ascending, perhaps?
        yoffset -= textItem.size.as("px") / 4;

        qmlfile.write("        text: \"" + textItem.contents + "\"\n");
        qmlfile.write("        font.pixelSize: " + Math.floor(textItem.size.as("px")) + "\n");
        qmlfile.write("        font.family: \"" + textItem.font + "\"\n");
        if (textItem.font.indexOf("Bold") != -1) qmlfile.write("        font.bold: true\n");
        if (textItem.font.indexOf("Italic") != -1) qmlfile.write("        font.italic: true\n");
        qmlfile.write("        color: " + qtColor(currentLayer.textItem.color) + "\n");
        qmlfile.write("        smooth: true\n");
    } else {
        qmlfile.write("        source: \"images/" + filename + "\"\n");
    }

    qmlfile.write("        x: " + xoffset + "\n");
    qmlfile.write("        y: " + yoffset + "\n");
    qmlfile.write("        opacity: " + opacity + "\n");
    qmlfile.write("    }\n");
}

function main() {
    exportInfo = new Object();
    if (cancelButton == setupDialog(exportInfo)) {
        return 'cancel';
    }

    app.preferences.rulerUnits = Units.PIXELS

    var imagefolder = new Folder(exportInfo.destination + "/images/");
    imagefolder.create();

    var documentName = app.activeDocument.name;
    app.activeDocument = app.documents[documentName];
    app.activeDocument.suspendHistory("export QML history", "");

    var documentCopy = app.activeDocument.duplicate();
    documentCopy.activeLayer = documentCopy.layers[documentCopy.layers.length - 1];

    createProgressBar();
    countLayers(documentCopy) // For progressBar

    openQMLFile();
    exportChildren(documentCopy, app.documents[documentName], exportInfo, documentCopy);
    closeQMLFile();

    documentCopy.close(SaveOptions.DONOTSAVECHANGES);
}

function exportChildren(dupObj, orgObj, exportInfo, dupDocRef) {
    // Track names to detect duplicates.
    var names = new Array;
    var uniqueCounter = 1;

    if (!exportInfo.exportByGroup) {
        hideAll(dupObj)
    }

    for (var i = dupObj.layers.length - 1; i >= 0 && !cancelExport; i--) {
        progressPanel.myProgressBar.value = (layerIndex++)/layerCount;
        app.refresh();      // required for progressbar updates

        // Skip hidden layers.
        var visible = orgObj.layers[i].visible;
        if (!visible && !exportInfo.exportHidden) {
            continue;
        }

        var currentLayer = dupObj.layers[i];

        // Ignore empty text layers
        if (currentLayer.kind == LayerKind.TEXT &&
            currentLayer.textItem.contents == "") {
            continue;
        }

        // Ensure unique layer names.
        while (names[currentLayer.name]) {
            // For some or other reason, this writeln crashes PS when not running
            // in debug mode (i.e. from File -> Script as opposed to through ExtendScript).
            //$.writeln("Warning: duplicate layer name: " + currentLayer.name);
            currentLayer.name = orgObj.layers[i].name +  "_#" + uniqueCounter++;
        }
        names[currentLayer.name] = true;

        if (!exportInfo.exportByGroup) {
            // Ignore layer groups and only show one layer at a time.
            if (currentLayer.typename== "LayerSet") {
                continue;
            }
            dupObj.layers[i].visible = true
        } else {
            // Hide all but current layergroup
            for (var k = dupObj.layers.length - 1; k >= 0; k--) {
                dupObj.layers[k].visible = (k==i)
            }
        }

        // Since we already save opacity, we dont want it affecting the output image
        var opacity = currentLayer.opacity / 100.0;
        currentLayer.opacity = 100;

        var documentCopyTmp = dupDocRef.duplicate();

        // Trim copied document to layer bounds
        if (activeDocument.activeLayer.isBackgroundLayer == false) {
            var bounds = currentLayer.bounds
            activeDocument.crop(bounds, 0, bounds.width, bounds.height)
        }

        var layerName = dupObj.layers[i].name; // store layer name before change doc
        var fileNameBody = layerName.toLowerCase();
        fileNameBody = fileNameBody.replace(/[ :\/\\*\?\"\<\>\|#]/g, "_"); // '/\:*?"<>|' -> '_'
        if (fileNameBody.length > 120) {
            fileNameBody = fileNameBody.substring(0, 120);
        }

        var filename = fileNameBody + ".png";
        var isText = (currentLayer.kind == LayerKind.TEXT && !(exportInfo.rasterizeText))

        // Write the QML object's properties to file.
        if (exportInfo.exportQML) {
            writeQMLProperties(isText, visible, opacity, currentLayer, fileNameBody, filename)
        }

        // Save the generated .png.
        if (!isText) {
            var saveFile = new File(exportInfo.destination + "/images/" + filename);
            pngSaveOptions = new PNGSaveOptions();
            pngSaveOptions.interlaced = false;
            documentCopyTmp.saveAs(saveFile, pngSaveOptions, true, Extension.LOWERCASE);
        }

        // Close tempfile.
        documentCopyTmp.close(SaveOptions.DONOTSAVECHANGES);

        if (!exportInfo.exportByGroup) {
            dupObj.layers[i].visible = false
        }
    }

    // Recursively export all the child layers of of this document (if any).
    if (!exportInfo.exportByGroup) {
        for (var i = 0; i < dupObj.layerSets.length; i++) {
            exportChildren(dupObj.layerSets[i], orgObj.layerSets[i], exportInfo, dupDocRef);
        }
    }
}