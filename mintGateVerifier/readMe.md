# to build

npm run build


# to develop using local version
cd ../mintGateVerifier
npm link

cd ../wpWidget/script
npm link mintgate-verifier

npm test

# To debug with chrome
npm run debug

ensure that localhost:9229 is added to the chrome://inspect tab



