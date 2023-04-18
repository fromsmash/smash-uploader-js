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
  <a href="https://unpkg.com/@smash-sdk/uploader/dist/SmashUploader.browser.js"><img src="https://img.badgesize.io/https://unpkg.com/@smash-sdk/uploader/dist/SmashUploader.browser.js?compression=gzip&color=green" /></a>
  <a href="https://unpkg.com/@smash-sdk/uploader/dist/SmashUploader.browser.js"><img src="https://img.badgesize.io/https://unpkg.com/@smash-sdk/uploader/dist/SmashUploader.browser.js?color=green" /></a>
  <br/>
  <img src="https://badges.herokuapp.com/browsers?labels=none&googlechrome=latest&firefox=latest&microsoftedge=latest&edge=latest&safari=latest&iphone=latest" />
</p>
<hr/>

SmashUploaderJS is a <b>simple and easy-to-use</b> JavaScript library for uploading files via the [Smash API & SDK](https://api.fromsmash.com/). With SmashUploaderJS, you can integrate Smash’s file upload functionality directly into your <b>websites, mobile apps, SaaS solutions and custom workflows</b>.
The Smash API & SDK allows you to <b>upload and share up to 5TB file size</b>. Come up for a 14 days free trial API key with up to <b>100GB</b>.


## Table of Contents

- [SmashUploaderJS](#smashuploaderjs)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
    - [Installing the library](#installing-the-library)
    - [Generating an API Key](#generating-an-api-key)
  - [Usage](#usage)
    - [Importing the library](#importing-the-library)
    - [Creating an instance](#creating-an-instance)
    - [Uploading a file](#uploading-a-file)
      - [Browser](#browser)
      - [Node](#nodejs)
    - [Events](#events)
  - [API Reference](#api-reference)
  - [Examples](#examples)
  - [Contributing](#contributing)
  - [License](#license)

## Installation

### Installing the library
You can install SmashUploaderJS using npm:

```
npm install @smash-sdk/uploader
```
### Generating an API Key
Before you can start using the library, you need to sign up for a <u>free trial</u> or a <u>premium plan</u> on the Smash website (https://api.fromsmash.com/). Once you're signed up, you can create an API Key by following these steps:

1. Log in to your Smash account and navigate to the "API Keys" section in your profile menu.
2. Click on the "Create secret key" button.
3. Give your API Key a name that will help you identify it later.
4. Click the "Create" button button to generate your new API Key. Make sure to copy the API Key and keep it somewhere safe, as you won't be able to see it again once you leave this page.

## Usage

### Importing the library

```
// Using ES6 module
import { SmashUploader } from '@smash-sdk/uploader';

// Or using CommonJS module
const { SmashUploader } = require('@smash-sdk/uploader');
```

Alternatively, you can also use it directly from a CDN:

```
<script src="https://unpkg.com/@smash-sdk/uploader/dist/SmashUploader.browser.js"></script>
```


### Creating an instance

```
const uploader = new SmashUploader({ region: "eu-west-3", token: "Put your api key here" })
```

Parameters:

- `region` (required): A string indicating the AWS region to use for the uploader. This should be one of the following values: <b>'eu-west-1'</b>, <b>'eu-west-2'</b>, <b>'eu-west-3'</b>, <b>'eu-central-1'</b>, <b>'us-east-1'</b>, <b>'us-east-2'</b>, <b>'us-west-1'</b>, <b>'us-west-2'</b>, or <b>'ca-central-1'</b>.
- `token` (required): A string containing the API Key for your Smash account..

### Uploading a file
#### Node.js

```
const files = [
    "./dummyFiles/dummy1.png",
    "./dummyFiles/dummy2.png",
    "./dummyFiles/dummy3.txt",
];

uploader.upload({ files, options }, {
  .then(({ transfer }) => { console.log("Transfer", transfer.transferUrl); })
  .catch(error => { console.log("Error", error); });
});
```
#### Browser

```
// Browser
const fileInput = document.querySelector('input[type="file"]');
const files = [...fileInput.files[0]];

uploader.upload({ files: [...fileInput.files], options })
  .then(({ transfer }) => { console.log("Transfer", transfer.transferUrl); })
  .catch(error => { console.log("Error", error); });
```
Parameters

  - `files` (required): An array of files to upload.
    - In a Node.js environment, `files` has to be an array of string representing the path location of the files.
    - In browser, `files` has to be an array of File.
  - `options` (optional): An object containing additional options for the transfer. This can include properties such as the transfer's title, description, access password, and delivery settings.
  <br>
  <br>
  The options object can have the following optional properties:

    - `title` (optional): A string containing the title of the transfer.
    - `description` (optional): A string containing a description of the transfer.
    - `teamId` (optional): A string containing the ID of the team to share the transfer with.
    - `customUrl` (optional): A string containing a custom URL for the transfer.
    - `language` (optional): A string indicating the language to use for the transfer.
    - `availabilityDuration` (optional): A number indicating the number of days the transfer should be available.
    - `preview` (optional): A string indicating whether to include a preview of the files in the transfer. Valid values are <b>"Full"</b> and <b>"None"</b>.
    - `password` (optional): A string containing the password for accessing the transfer.
    - `delivery` (optional): An object containing options for delivering the transfer, including:
        type (required): A string indicating the delivery method to use. Valid values are <b>"Email"</b> and <b>"Link"</b>.
        - `sender` (optional): An object containing information about the sender, including:
            - `name` (optional): A string containing the name of the sender.
            - `email` (required): A string containing the email address of the sender. <b>Only for "Email" delivery type.</b>
        - `receivers` (optional): An array of strings containing the email addresses of the recipients.
    - `customization` (optional): An object containing customization options for the transfer, including:
        - `logo` (optional): A string containing the URL of the logo to use for the transfer.
        - `background` (optional): A string containing the URL of the background image to use for the transfer.
    - `promotion` (optional): An object containing the ID of the promotion to apply to the transfer.
    - `accessTracking` (optional): A string indicating whether to track access to the transfer. Valid values are <b>"Email"</b> and <b>"None"</b>.
    - `notificationType` (optional): A string indicating the type of notification to send. Valid values are <b>"None"</b> and <b>"All"</b>.

Output

The upload() promise returns an object with the following properties :

- `transfer`
  - `id`: A string containing the ID of the uploaded transfer.
  - `status`: A string containing the status of the transfer.
  - `uploadStatus`: A string containing the status of the upload.
  - `region`: A string containing the AWS region where the files are stored.
  - `transferUrl`: A string containing the URL of the transfer.
  - `uploadState`: A string containing the state of the upload.
  - `availabilityEndDate`: A string containing the date when the transfer will no longer be available.
  - `availabilityDuration`: A number containing the duration (in days) that the transfer will be available.
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

```
uploader.on('progress', (event) => {
  console.log(`Upload progress: ${event.data.percent}%`);
});
```

For more information about the different SmashUploader events, please refer to the documentation.


## API Reference

Please refer to the [API documentation](https://api.fromsmash.com/docs/integrations/node-js) for more information on the available methods and options.

## Examples

You can find example usage and integration of SmashUploaderJS in the [examples](https://github.com/fromsmash/example-js) folder.

## Contributing

We welcome contributions! If you'd like to help improve SmashUploaderJS, please fork the repository, make your changes, and submit a pull request.

## License

SmashUploaderJS is released under the MIT License