export enum ExternalURL {
  twitter,
  nouns,
  reactskinview,
}

export const externalURL = (externalURL: ExternalURL) => {
  switch (externalURL) {
    case ExternalURL.twitter:
      return 'https://twitter.com/charcombination';
    case ExternalURL.nouns:
      return 'https://github.com/nounsDAO/nouns-monorepo/tree/master/packages/nouns-assets';
    case ExternalURL.reactskinview:
      return 'https://github.com/Hacksore/react-skinview3d';
  }
};
