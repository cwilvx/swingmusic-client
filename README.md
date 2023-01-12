<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 784 114" width="784" height="114">
  <!-- svg-source:excalidraw -->
  <defs>
    <style class="style-fonts">
      @font-face {
        font-family: "Virgil";
        src: url("https://excalidraw.com/Virgil.woff2");
      }
      @font-face {
        font-family: "Cascadia";
        src: url("https://excalidraw.com/Cascadia.woff2");
      }
    </style>
  </defs>
  <rect x="0" y="0" width="784" height="114" fill="#ffffff"></rect><g stroke-linecap="round" transform="translate(10 10) rotate(0 382 47)"><path d="M23.5 0 M23.5 0 C215.78 1.44, 412.53 0.31, 740.5 0 M23.5 0 C281.51 -5.39, 540.97 -5.16, 740.5 0 M740.5 0 C753.39 2.07, 765.57 6.41, 764 23.5 M740.5 0 C751.65 2.03, 761.95 10.91, 764 23.5 M764 23.5 C765.22 38.93, 764.07 54.39, 764 70.5 M764 23.5 C765.71 35.55, 762.55 50.68, 764 70.5 M764 70.5 C767.93 86.58, 758.49 93.89, 740.5 94 M764 70.5 C764.02 86.35, 752.13 91.39, 740.5 94 M740.5 94 C527.53 91.64, 315.65 91.8, 23.5 94 M740.5 94 C478.72 89.22, 217.48 88.45, 23.5 94 M23.5 94 C6.69 94.57, 2.33 89.15, 0 70.5 M23.5 94 C11.38 93.18, 4.58 86.22, 0 70.5 M0 70.5 C-1.6 61.79, -4.18 54.1, 0 23.5 M0 70.5 C0.49 59.36, 0.09 50.04, 0 23.5 M0 23.5 C0.11 9, 4.33 1.63, 23.5 0 M0 23.5 C0.11 6.62, 10.72 -1.87, 23.5 0" stroke="#000000" stroke-width="1" fill="none"></path></g><g transform="translate(180 34) rotate(0 212 23)"><text x="212" y="32" font-family="Virgil, Segoe UI Emoji" font-size="36px" fill="#000000" text-anchor="middle" style="white-space: pre;" direction="ltr">🎵 Swing music player 🎵</text></g>
</svg>

---

### Make listening to your local music fun again.

`Swing` is a music player for local audio files that is built with both visual coolness and functionality in mind. Just run the app and enjoy your music library in a web browser.

> Note: This project is in the early stages of development. Many features are missing but will be added with time.

The app is currently only available on linux. (I don't have access to a Windows machine for building and testing purposes and my machine is not strong enough to support Windows in VM).

# Setup

Download the latest release from the [release page](#) and extract it in your machine. Then execute the extracted file in a terminal.

```bash
./swing
```

The file will start the app at <http://localhost:1970> by default. See the setup option section on how to change the host and port.

# Setup options

```
Usage: swing [options]

Options:
    --host: Set the host
    --port: Set the port
    --help, -h: Show this help message
    --version, -v: Show the version
```

# Development

This project is broken down into 2. The client and the server. The client comprises of the user interface code. This part is written in Typescript, Vue 3 and SCSS. To setup the client, checkout the [swing client repo ](#) on GitHub.

The second part of this project is the server. This is the main part of the app that runs on your machine, interacts with audio files and send data to the client. It's written in Python 3.

The following instructions will guide you on how to setup the **server**.

---

The project uses [Python poetry](https://python-poetry.org) as the dependency manager. Follow the instructions in [their docs](https://python-poetry.org/docs/) to install it in your machine.

> It is assumed that you have `Python 3.10` or newer installed in your machine. This project uses duck typing features so older version of Python will not work. If you don't have Python installed in your machine, get it from the [python website](https://www.python.org/downloads/).

Clone this repo locally in your machine. Then install the project dependencies and start the app.

```sh
git clone <$>

cd swing-core

# install dependencies using poetry
poetry install

# start the app
poetry run python manage.py
```

# License

This software is provided to you with terms stated in the MIT License. Read the full text in the `LICENSE` file located at the root of this repository.

# Contributing

If you want to contribute to this project, feel free to open an issue or a pull request on Github. Your contributions are highly valued and appreciated. Feature suggestions, bug reports and code contribution are welcome.

# A brain dump ...

I started working on this project on dec 2021. Why? I like listening and exploring music and I like it more when I can enjoy it (like really really). I'd been searching for cute music players for linux that allow me to manage my ever growing music library. Some of the main features I was looking for were:

- A simple, lively and beautiful user interface (main reason)
- Creating automated daily mixes based on my listening activity.
- Ability to move files around without breaking my playlists and mixes.
- Something that can bring together all the audio files scattered all over my disks into a single place.
- Browsing related artists and albums.
- Reading artists and albums biographies.
- Web browser based user interface.
- a lot more ... but I can't remember them at the moment

I've been working to make sure that most (if not all) of the features listed above are built. Some of them are done, but most are not even touched yet. A lot of work is needed and I know that it will take a lot of time to build and perfect them.

I've been keeping a small 🤥 list of a few cool features that I'd like to see implemented in the project. You can check it out in [this notion page](https://rhetorical-othnielia-565.notion.site/Cool-features-1a0cd5b797904da687bec441e7c7aa19). https://rhetorical-othnielia-565.notion.site/Cool-features-1a0cd5b797904da687bec441e7c7aa19

I have been working on this project solo, so it’s very hard to push things fast. The app is written in Python for the backend and Vue3 for the client. If you have knowledge in any or both of this areas, feel free to contribute to the project. We’ll be excited to have you. Your help is highly appreciated.

_The backend is honestly a bunch of Python classes and functions. The client just sends API request and displays it._

I’m quite a noob myself. I started _serious_ programming in 2021. If you don’t know much programming, come and let’s grow together. If you have some good programming experience, we have been waiting for you.

---

**MIT License | Copyright (c) 2023 Mungai Njoroge** 