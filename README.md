# SmashUploaderJS - Upload big file API

![version](https://img.shields.io/badge/version-0.0.8-green)
![license](https://img.shields.io/badge/license-MIT-blue)


SmashUploaderJS is a simple and easy-to-use JavaScript library for uploading files using the [Smash API file transfer](https://api.fromsmash.com/) service. With SmashUploaderJS, you can integrate Smash’s file upload functionality directly into your websites, mobile apps, SaaS solutions and custom workflows.
The Application Programming Interface from Smash allows you to upload and share up to 5TB file size. Come up for a 14 days free trial API key with up to 100GB.


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
