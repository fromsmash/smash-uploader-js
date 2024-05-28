<p align="center">
  <a href="https://api.fromsmash.com/"><img src="https://developer.fromsmash.com/LOGO_SMASH_API.png" align="center" width="135" /></a> 
  <h1 align="center">SmashUploaderJS - Upload library <br>powered by the Smash API & SDK</h1> 
</p>
<p align="center">
  <strong>Official JavaScript library to upload & share large files and folders (Node.js, browsers) using the Smash API & SDK 🚀</strong>
</p>
<br/>
<p align="center">
  <a href="https://npmjs.com/package/@smash-sdk/uploader"><img src="https://img.shields.io/npm/v/@smash-sdk/uploader.svg" /></a>
  <a href="https://unpkg.com/@smash-sdk/uploader@2.1.3/dist/SmashUploader.browser.js"><img src="https://img.badgesize.io/https://unpkg.com/@smash-sdk/uploader@2.1.3/dist/SmashUploader.browser.js?compression=gzip&color=green" /></a>
  <a href="https://unpkg.com/@smash-sdk/uploader@2.1.3/dist/SmashUploader.browser.js"><img src="https://img.badgesize.io/https://unpkg.com/@smash-sdk/uploader@2.1.3/dist/SmashUploader.browser.js?color=green" /></a>
  <br/>
  <img src="https://badges.herokuapp.com/browsers?labels=none&googlechrome=latest&firefox=latest&microsoftedge=latest&edge=latest&safari=latest&iphone=latest" />
</p>
<hr/>

SmashUploaderJS is a **simple and easy-to-use** JavaScript library for uploading files via the [Smash API & SDK](https://api.fromsmash.com/). With SmashUploaderJS, you can integrate Smash’s file upload functionality directly into your **websites, mobile apps, SaaS solutions and custom workflows**.
The Smash API & SDK allows you to **upload and share up to 5TB file size**. Come up for a 14 days free trial API key with up to **100GB**.


## Table of Contents

- [Table of Contents](#table-of-contents)
- [Installation](#installation)
  - [Package manager](#package-manager)
  - [CDN](#cdn)
  - [Generating an API Key](#generating-an-api-key)
- [Usage](#usage)
  - [Importing the library](#importing-the-library)
  - [Creating an instance](#creating-an-instance)
  - [Uploading a file](#uploading-a-file)
    - [Node.js](#nodejs)
    - [Browser](#browser)
  - [Events](#events)
- [API Reference](#api-reference)
- [Examples](#examples)
  - [Node.js examples](#nodejs-examples)
  - [Browser examples](#browser-examples)
- [Resources](#resources)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Package manager
You can install SmashUploaderJS using npm:

```bash
npm install @smash-sdk/uploader
```

### CDN

For browser usage, you can use it directly from the unpkg CDN:

```html
<script src="https://unpkg.com/@smash-sdk/uploader@2.1.3/dist/SmashUploader.browser.js"></script>
```

### Generating an API Key
Before you can start using the library, you need to sign up for a <u>free trial</u> or a <u>premium plan</u> on the [Smash website](https://api.fromsmash.com/). Once you're signed up, you can create an API Key by following these steps:

1. Log in to your Smash account and navigate to the "API Keys" section in your profile menu.
2. Click on the "Create secret key" button.
3. Give your API Key a name that will help you identify it later.
4. Click the "Create" button button to generate your new API Key. Make sure to copy the API Key and keep it somewhere safe, as you won't be able to see it again once you leave this page.

## Usage

### Importing the library

```js
// Using ES6 module
import { SmashUploader } from '@smash-sdk/uploader';

// Or using CommonJS module
const { SmashUploader } = require('@smash-sdk/uploader');
```

For browser usage, you can use it directly from the unpkg CDN:

```html
<script src="https://unpkg.com/@smash-sdk/uploader@2.1.3/dist/SmashUploader.browser.js"></script>
```


### Creating an instance

```js
const uploader = new SmashUploader({ region: "eu-west-3", token: "Put your Smash API Key here" })
```

Parameters:

- `region` (required): A string indicating the Smash region to use for the uploader. **It should be the same region as your API key.*** To find the corresping region, go to the [Smash developer account API Keys section](https://developer.fromsmash.com/apikeys) and find the region of your API Key. This should be one of the following values: **'eu-west-1'**, **'eu-west-2'**, **'eu-west-3'**, **'eu-central-1'**, **'us-east-1'**, **'us-east-2'**, **'us-west-1'**, **'us-west-2'**, or **'ca-central-1'**.
- `token` (required): A string containing your [smash API Key](#generating-an-api-key).

### Uploading a file
#### Node.js

```js
const files = [
    "./dummyFiles/dummy1.png",
    "./dummyFiles/dummy2.png",
    "./dummyFiles/dummy3.txt",
];

uploader.upload({ files })
  .then(({ transfer }) => { console.log("Transfer", transfer.transferUrl); })
  .catch(error => { console.log("Error", error); 
});
```
You can find node usage and integration examples of SmashUploaderJS in the dedicated [examples folder](https://github.com/fromsmash/example-js/tree/main/node/ts).
#### Browser

```js
const fileInput = document.querySelector('input[type="file"]');
const files = [...fileInput.files[0]];

uploader.upload({ files: [...fileInput.files] })
  .then(({ transfer }) => { console.log("Transfer", transfer.transferUrl); })
  .catch(error => { console.log("Error", error); 
});
```
You can find example browser usage and integration of SmashUploaderJS in the dedicated [examples folder](https://github.com/fromsmash/example-js/tree/main/browser/js/uploader).

`upload(params: UploadInput): Promise<UploadOutput>` 

 UploadInput

  - `files` (required): An array of files to upload. In a Node.js environment, `files` has to be an array of string representing the path location of the files. In browser, `files` has to be an array of File.
  - `title` (optional): A string containing the title of the transfer.
  - `description` (optional): A string containing a description of the transfer.
  - `teamId` (optional): A string containing the `Team ID` of a domain you created in the [Smash developer Settings section](https://developer.fromsmash.com/settings/domains). The generated `transferUrl` will be specific to the domain associated with the provided teamId, and will be in the following format: `https://your-domain.fromsmash.com/{transferId}`. If no teamId is provided, the default domain will be used and will be in the following format: `https://fromsmash.com/{transferId}`.
  - `customUrl` (optional): A string containing a custom URL for the transfer. After uplading, the generated `transferUrl` will be in the following format: `https://your-domain.fromsmash.com/{customUrl}` or `https://fromsmash.com/{customUrl}`.
  - `language` (optional): A string indicating the language code to use for the transfer. It should be an [ISO 639-1 code](https://www.iso.org/standard/22109.html) (two-letter codes, available languages are `'en'`, `'es'`, `'fr'`, `'de'`, `'it'`, `'pt'`).
  - `availabilityDuration` (optional): A number indicating the duration (in seconds) the transfer should be available.
  - `preview` (optional): A string indicating whether to include a preview of the files in the transfer. Valid values are `"Full"` and `"None"`.
  - `password` (optional): A string containing the password for accessing the transfer.
  - `delivery` (optional): An object containing options for delivering the transfer, including:
      - `type` (required): A string indicating the delivery method to use. Valid values are `"Email"` and `"Link"`.
      - `sender` (optional): An object containing information about the sender, including:
          - `name` (optional): A string containing the name of the sender.
          - `email` (required): A string containing the email address of the sender.
      - `receivers` (optional): An array of strings containing the email addresses of the recipients. **Only for `"Email"` delivery type.**
  - `customization` (optional): An object containing customization options for the transfer, including:
      - `logo` (optional): A string containing the URL of the logo to use for the transfer.
      - `background` (optional): A string containing the URL of the background image to use for the transfer.
  - `accessTracking` (optional): A string indicating whether to track access to the transfer. Valid values are `"Email"` and `"None"`.
  - `notification` (optional): An object containing options for enable/disable notifications, including:
      - `sender` (optional): An object containing options for sender notifications (only for `"Email"` delivery type), including:
          - `enabled`: A boolean indicating whether to send a confirmation email to the sender when the transfer is uploaded and send to the receiver(s).
      - `receiver` (optional): An object containing options for receiver notifications (only for `"Email"` delivery type), including:
          - `enabled`: A boolean indicating whether to send a notification email to the receiver(s).
      - `link` (optional): An object containing options for link notifications (only for `"Link"` delivery type), including:
          - `enabled`: A boolean indicating whether to send a confirmation email with the transfer download link to the sender.
      - `download` (optional): An object containing options for download notifications, including:
          - `enabled`: A boolean indicating whether to send email notifications to the sender when the transfer is downloaded.
      - `noDownload` (optional): An object containing options for no download notifications, including:
          - `enabled`: A boolean indicating whether to send email notification when the transfer is about to expire and has not been downloaded.      

UploadOutput

- `transfer`
  - `id`: A string containing the ID of the uploaded transfer.
  - `status`: A string containing the status of the transfer.
  - `region`: A string containing the Smash region where the files are stored.
  - `transferUrl`: A string containing the URL of the transfer.
  - `uploadState`: A string containing the state of the upload.
  - `availabilityEndDate`: A string containing the date when the transfer will no longer be available.
  - `availabilityDuration`: A number containing the duration (in seconds) that the transfer will be available.
  - `availabilityStartDate`: A string containing the date when the transfer becomes available.
  - `size`: A number containing the total size of the uploaded files (in bytes).
  - `preview`: An object containing information about the preview of the uploaded files.
  - `created`: A string containing the creation date of the transfer.
  - `modified`: A string containing the modification date of the transfer.
  - `filesNumber`: A number containing the number of files in the transfer.

### Events

SmashUploaderJS provides several events that you can listen to:

- `progress`: Fired when the upload progress is updated.
    - `name`: The name of the event (`progress`).
    - `data`: An object containing information about the upload progress. The available properties are:
      - `totalBytes`: A number indicating the total size of the uploaded file in bytes.
      - `uploadedBytes`: A number indicating the number of bytes that have been uploaded so far.
      - `percent`: A number indicating the percentage of the file that has been uploaded.
      - `speed`: A number indicating the upload speed in bytes per second.
      - `estimatedTime`: A number indicating the estimated time (in seconds) remaining until the upload is complete.
      - `remainingTime`: A number indicating the remaining time (in seconds) until the upload is complete.

```js
uploader.on('progress', (event) => {
  console.log(`Upload progress: ${event.data.percent}%`);
});
```

Other available events are listed below. 

* `queued` 
* `starting`
* `started` 
* `finishing` 
* `finished` 
* `canceled`
* `error` 

For more information about the different SmashUploader events, please refer to the [Smash API documentation](https://api.fromsmash.com/docs/integrations).  
## API Reference

Please refer to the [API documentation](https://api.fromsmash.com/docs/integrations/node-js) for more information on the available methods and options.

## Examples

### Node.js examples

You can find node usage and integration examples of SmashUploaderJS in the dedicated [examples folder](https://github.com/fromsmash/example-js/tree/main/node/ts).
### Browser examples

You can find example browser usage and integration of SmashUploaderJS in the dedicated [examples folder](https://github.com/fromsmash/example-js/tree/main/browser/js/uploader).

## Resources

* [Changelog](https://github.com/fromsmash/smash-uploader-js/blob/main/CHANGELOG.md)

## Contributing

We welcome contributions! If you'd like to help improve SmashUploaderJS, please fork the repository, make your changes, and submit a pull request.

## License

SmashUploaderJS is released under the MIT License