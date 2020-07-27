## Crowdcourcing Tool for  [VerbaAlpina](https://www.verba-alpina.gwi.uni-muenchen.de/)

### Installation Instructions:

1. Copy Plugin Folder in the "plugins" Directory of your Wordpress Installation.
2. Specify the Database connection in va_crowdsourcing-lib.php
2. Activate Plugin From the Admin Page
3. Add template_plugin_frontend.php to your active Theme Folder
3. Create a Page, on with the CS Tool will be displayed
4. Add shortcode to the page: "[initMenu]"
5. Set the Page Template to "Plugin Fullscreen Template CS" and Save the Page


### Plugin Structure:
#### Backend
##### va_crowdsourcing.php :
 Initialization of Plugin - Loading Scripts
##### va_crowdsourcing-lib.php :
 Manages Frontend Scripts and Styles Register/Enques, Establishes Database Connection
##### handle_ajax.php :
 Handles main logic, Registers and Handles all Action And Filter Hooks

#### Frontend
##### action_ajax.js: 
All defined Ajax Calls to server
##### content_interactions.js: 
Main Application Logic, handles all UI and events
##### generateMap.js: 
Main Map logic and visualization
##### image_upload_controller.js: 
Image Uploading Logic and UI
##### style.css:
All styles and Media Queries

