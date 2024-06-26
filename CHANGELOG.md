# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.2] - 2024-04-15

### Fixed
- bug : fixed bug on queue management

## [2.1.0] - 2024-03-18

### Added

- Added dropbox (optional) attribute in UploadInput. It is the dropbox id of the dropbox where the files will be uploaded.

## [2.0.0] - 2024-02-15

### Changed

- Changed attribute notificationType to notification in UploadInput
- Changed interface NotificationType to Notification

## [1.2.1] - 2023-07-20

### Fixed
- bug : fixed bug on type checking 
## [1.2.0] - 2023-07-18

### Added
- upload: added support of string and Buffer upload 
### Fixed
- errors: improved error handling
## [1.1.0] - 2023-07-17

### Added
- errors: added specific uploader errors 
- events : added 'changes' event
### Fixed
- errors: improved error handling

## [1.0.0] - 2023-04-20

### Fixed
- types: fixed TransferOutput interface by refactoring to UploadOutput
- types: renamed CreateTransferParameters for UploadInput
- types: renamed UpdateTransferParameters for UpdateTransferInput
- params: removed uploadStatus from events emitted
- readme: added links and more accurate documentation

## [0.0.17] - 2023-04-18

### Fixed
- Fix README
## [0.0.16] - 2023-04-18

### Fixed
- Fix README
## [0.0.15] - 2023-04-18

### Fixed
- Fix README

## [0.0.14] - 2023-04-18

### Fixed
- Fix README

## [0.0.13] - 2023-04-14

### Fixed
- Fix README


## [0.0.12] - 2023-04-14

### Fixed
- Fix keywords in package.json


## [0.0.11] - 2023-04-14

### Added
- Add LICENSE

### Fixed
- Fix README


## [0.0.10] - 2023-04-13

### Fixed
- Fix README


## [0.0.9] - 2023-04-11

### Fixed
- Fix issue with progress event


## [0.0.8] - 2023-03-28

### Added
- Add readme.md

### Fixed
- Fix error management


## [0.0.7] - 2023-02-15

### Added

- Support of 0 byte files

### Fixed 

- Fix bug with file over 1 GBytes

## [0.0.6] - 2022-12-21

### Added

- Add possibility to force file name as input parameter of SmashUploader.upload()

## [0.0.5] - 2022-12-07

### Added

- Add browser support with webpack


## [0.0.3] - 2022-11-24

### Changed

- Changed parameter name team to teamId of SmashUploader.upload() method

### Removed

- Remove domain parameter of SmashUploader.upload() method
