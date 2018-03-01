# Ryo
Notification bot (LondonPogoMap to public Discord channels) for raids, paired with gym data pipeline.

## App files
A summary of the app files; an outline of the gym data pipeline is available [here](https://github.com/Pyorot/Ryo/blob/master/data/gym/_manifest.txt), and the test suite is described as the readme of the test/ folder.
* **index.js** – runs the data fetching and processing cycle, managing the data model and handling alerting and logging.

* **alert.js** – tests incoming raids against user-defined filters and handles their notification construction and sending.

* **gym.js** – routines to (re)load gyms and alert filters.

* **log.js** – routines to manage the logging of raid data to files.

* **fetch.js** – wraps LondonPogoMap HTTP endpoint and error-handling.

* **post.js** – wraps Discord HTTP endpoint and error-handling.

### Utilities
* **date.js** – Script that adds useful formatting and conversion methods to the built-in Date object.

* **error.js** – Module that logs error information to ./error.txt.

## Design outline
Gym data is constructed via the data/gym/ folder and stored at data/gyms.json. This takes the form of a co-ordinate–indexed dictionary of gym objects. Ryo loads these and initialises them with `raid` and `alerts` properties.

As data about current raids is polled from LondonPogoMap, Ryo determines which raids are newly-discovered, assigns them to the gyms they belong to (at `raid`), then pushes them for filtering/sending (using filters stored at `alerts`) and logging to file. In this way, it also logs gyms missing from the data.

Alert settings are stored in channels/, and are loaded to the `alerts` properties of the gyms. See the channels/ readme for more details.

## To set up
* [authenticate your IP address with the Discord gateway](https://pastebin.com/NRh6Lb90).
* Create a .env file, containing configuration variables that are loaded when the app is started:
    * `KEY_BOT` is the Discord bot token;
    * `ALERT = true`/`false` toggles alerts being sent for new gyms and being automatically loaded;
    * `LOG = true`/`false` toggles new gyms being logged to file and a new file being automatically created on load and then daily;
    * `POST = true`/`false` toggles real/test posting mode (Discord/console rsp.);
    * `AUTORUN = true`/`false` toggles starting the bot upon load (loads gyms, optionally alerts and log, then starts loop).
    * `CONTROL = true/false` toggles the console keypress interface. It must be disabled to run the automatic test suite at test/ or to do manual REPL testing.

## To run
* with `AUTORUN = true` set in `.env`, open command line in the program directory and run `node .` ("node dot").
* if `CONTROL = true` is set in `.env`, the following keys may be typed into the console.
***Warning**: if using Powershell, only click the title-bar to activate the window, as clicking the console pauses the bot's execution.*
    * `h` – prints a list of commands;
    * `a` – reloads alerts from channels/;
    * `g` – loads info from gyms.json for any gyms without info;
    * `l` – restarts the log (at a new file with the current date in its title);
    * `x` – exits the program.