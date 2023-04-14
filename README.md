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
  <a href="https://unpkg.com/@smash-sdk/uploader@0.0.9/dist/SmashUploader.browser.js"><img src="https://img.badgesize.io/https://unpkg.com/@smash-sdk/uploader@0.0.9/dist/SmashUploader.browser.js?compression=gzip&color=green" /></a>
  <a href="https://unpkg.com/@smash-sdk/uploader@0.0.9/dist/SmashUploader.browser.js"><img src="https://img.badgesize.io/https://unpkg.com/@smash-sdk/uploader@0.0.9/dist/SmashUploader.browser.js?color=green" /></a>
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
  - [Usage](#usage)
    - [Importing the library](#importing-the-library)
    - [Creating an instance](#creating-an-instance)
    - [Uploading a file](#uploading-a-file)
    - [Events](#events)
  - [API Reference](#api-reference)
  - [Examples](#examples)
  - [Contributing](#contributing)
  - [License](#license)

## Installation

You can install SmashUploaderJS using npm:

```
npm install @smash-sdk/uploader
```

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
const uploader = new SmashUploader();
```

### Uploading a file

```
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

uploader.upload(file, {
  onSuccess: (response) => console.log('Upload success:', response),
  onError: (error) => console.error('Upload error:', error),
});
```

### Events

SmashUploaderJS provides several events that you can listen to:

- `start`: Fired when the upload starts.
- `progress`: Fired when the upload progress is updated.
- `success`: Fired when the upload is successfully completed.
- `error`: Fired when an error occurs during the upload.
- `end`: Fired when the upload is completed, regardless of the outcome (success or error).

```
uploader.on('progress', (progress) => {
  console.log(`Upload progress: ${progress}%`);
});

uploader.on('success', (response) => {
  console.log('Upload success:', response);
});

uploader.on('error', (error) => {
  console.error('Upload error:', error);
});
```

## API Reference

Please refer to the [API documentation](https://api.fromsmash.com/docs/integrations/node-js) for more information on the available methods and options.

## Examples

You can find example usage and integration of SmashUploaderJS in the [examples](https://github.com/fromsmash/example-js) folder.

## Contributing

We welcome contributions! If you'd like to help improve SmashUploaderJS, please fork the repository, make your changes, and submit a pull request.

## License

SmashUploaderJS is released under the MIT License