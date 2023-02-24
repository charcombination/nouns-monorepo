# NounsMC

This package contains the source for the Nouns Skin Generator at [nounsmc.wtf](https://nounsmc.wtf). It is a beta based on the [Nouns-Monorepo] and will change over time.

## Changelog

This project hasn't officially launched. You may or may not find a working deployment [here].(https://nouns-mc.vercel.app/)

## Contributing With Art

The Skins that can be generated are defined by the `image-data.json` file in `nouns-webapp/src/nounsdao-assets/`. It is structured as follows:

```json
{
  "filename": "accessory-body-gradient-ice",
  "data": "0x0015...41", // string defining the svg to display the Noun
  "skin": "data:image/png;base64,iVBO...II=" // base-64 encoded component
}
```

To contribute with new components, you can
1. Look for components that can be illustrated on the [NounsDAO Playground]()
2. Redesign them using a [Minecraft Skin Editor]()
3. Make the background transparent for sections which are not relevant, i.e. the body for head-components. This requires a more advanced image editor.
4. Encode the image in base64
5. Copy the respective json section from `image-data-old.json` and add a `skin` attribute with the base64-String

## Quickstart

_From the base of the `nouns-monorepo`_

In a shell:

```sh
# Switch to nouns-webapp
cd packages/nouns-webapp
# Install required dependencies
yarn
# Start the program
yarn start
```
