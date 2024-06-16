# AstroCrypto

 Encrypted content in Astro static sites.

## Why?
Two reason really;

1. I wanted to use the WebCrypto API so that I could add it to the long list of web APIs I've built something with but never never really used that much because it turns out to be too niche.
2. I wanted to be able to create a simple site with links out to the various tools I run on a server so I could easily get to them but I didn't want a list of things that could potentially be exploited to just be sitting out there in the open.

The security of this isn't great. If the content truly must be kept secured you're going to want to manage it on the server where you have complete control over it. Placing the content into the clients browser, even encrypted, gives a bad actor all they need to crack it at their leisure.

Additionally, this project has not been audited or extensively tested. It _should_ be as secure as it can be all things considered but if you make use of it for anything important you've already made a mistake. If you want to use it for something unimportant and find an issue feel free to make a PR.

## Example

The site viewable at https://pgooch.github.io/AstroCrypto/, no awards for guessing the password though.

## Running and Building
| Command        | Action                                       |
| :------------- | :------------------------------------------- |
| `yarn install` | Installs dependencies                        |
| `yarn dev`     | Starts local dev server at `localhost:4321`  |
| `yarn build`   | Build your production site to `./dist/`      |
| `yarn preview` | Preview your build locally, before deploying |
