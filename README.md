# leaflet-points-sidebar
Leaflet Point Map with Sidebar with Google Sheets

Data: https://docs.google.com/spreadsheets/d/1h1rJa-fshPbuzaqabQUjIDmuM2O6f5K0KPEvaAQT568/edit#gid=0

## Editing data
The tool reads data from a single CSV file that follows a template.
The file can be either local or remote, such as one published by
Google Sheets. To specify the location of the CSV file, go to `settings.js`,
and edit the `dataLocation` variable.

If you want to maintain a database in Google Sheets, your document needs to be public.
Click `Share` button, and change permissions to *Anyone on the internet with this link can view*.
Then go to `File > Publish to the web > Entire Document`,
and choose `Comma-separated values (.csv)`. Copy the resulting URL to the `dataLocation`
variable from `settings.js` file. You **do not** need to use a Google API key; the CSV file
will be available to download for anyone with the link.

## Assigning the same place to 2 or more categories
If you have a palce that belongs to two or more categories (or themes, groups),
make sure to copy this place's row several times, each time modifying the
*Group* column only.

## Adding Google Maps links
Use [Google Maps](https://www.google.com/maps) to search a place (for example,
"Frog Bridge, Connecticut"), then hit `Share` button, and copy the *Link to share*
to `GoogleMapsLink` column of your CSV database. The tool will display a box
with the link under a place description automatically.

## Adding images
Each place can have up to 5 images. Only the first image is shown in the
sidebar. To scroll through the gallery, click an image to bring up a full-screen
lightbox interface. The lightbox will say how many images there are, and will show
a caption, source, and link (if available) for each image.