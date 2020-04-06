# MonbotJS
A rewrite of Monbot.py using ES6 and TypeScript.

## Setup
1) Clone this repository. (If you don't have Git, get it here: https://git-scm.com/downloads)
2) Get `Node` and `npm`, frequently downloaded together here: https://nodejs.org/en/.
- Node lets us run the Monbot script so that the bot can accept user input (among other functionality).
- npm is a popular package manager for JavaScript.
3) Using a terminal such as Windows PowerShell, change your directory to the project and run `npm install`:
```
cd /example/directory/Monbotjs
```
```
npm install
```

`npm install` will download the project's third-party dependencies into the `node_modules` folder. Some of our dependencies include:
- `TypeScript`, which enables features such as inline typehints
- `Jasmine` for automated tests
- `Ramda` for common functional programming utilities

## Tests
Automated tests assert that the code behaves in the way we expect. Source code should typically be accompanied with tests in the `tests` folder.
To run unit tests, enter the command into your terminal:
```
npm test
```

If there are failures, this typically indicates that something in the code is misbehaving and must be fixed.