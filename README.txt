# qt-labs-photoshop-qmlexporter

An Adobe PhotoShop plug-in that generates usable Qt QML files and output directly from (layered) art.

The script has been tested on Photoshop CS6, CS5 and CS4 and may or may not work on previous or
newer versions.

## INSTALLATION

- Copy "Export QML.jsx" to your "Photoshop/Plugins/Presets/Scripts"
(note that this path might be slightly different on your computer)

**Run or restart PhotoShop**

The exporter should now show up under "File/Scripts/Export QML"

## Usage

Running the plug-in will result in a dialog that asks for the following:

"Element name"
- This is the name of the output QML file

"Output Folder"
- The folder containing exported files. Files are replaced
  without warning.

"Rasterize text"
- Force text layers to be exported as images and not text
  elements

"Group layers"
- This will export each top-level group as a merged
  QML Image element.

"Export hidden"
- If checked, hidden layers are exported but their
  visible property is set to false.

"Export QML"
- Uncheck this if you have modified your QML document by
  hand but still want to re-export graphical assets.

Output:
- Layers and groups are exported as image elements in
  the root.qml file and png images are dumped into the
  images subirectory.
- Text items are exported as Text elements

Notes:
- Files are replaced without warning!

Known issues:
- The font names are not really mapped accurately at the moment.

Note that layer names are used to determine the id's of the exported QML components as well
as the file names for the generated .png's and are processed according to the following criteria:

From http://doc.qt.io/qt-5/qtqml-syntax-objectattributes.html

*"This id must begin with a lower-case letter or an underscore, and cannot contain characters
other than letters, numbers and underscores"*

Based on my interpretation of the QML id requirements I decided to therefore only allow characters
that are included in the following Unicode categories:

http://www.fileformat.info/info/unicode/category/Ll/list.htm and
http://www.fileformat.info/info/unicode/category/Lu/list.htm

(as well as standard digits and the underscore ('_') character)

Generated id's are furthermore stripped of leading digits (QML requirement) as well as leading and
trailing underscores.  Multiple consecutive underscores are also 'condensed' into single underscores
in order to ensure that a layer name such as 'blah@#$@#$123' becomes the id 'blah_123' instead
of 'blah______123'.

Offset, size, ordering and opacity are currently preserved.

## Version History

* Version 0.5
- Fixed progress bar update issue.
- Fixed .png transparency issue.
- Improved QML 'id' generation.
- Made primary "import" module configurable.
- Automatically wrap text in "qsTr" tags.

* Version 0.4:
- Added progressbar and cancel button

* Version 0.3:
- Added support for exporting layer groups
- Made updating the QML file optional
- Fixed a bug preventing files with groups from exporting
- Set Export as default button
- Fixed a problem with unique ID's

* Version 0.1:
- Initial version

