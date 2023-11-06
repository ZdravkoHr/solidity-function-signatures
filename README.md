# Details
This is a tool for extracting solidity function signatures written in Node.js. The script is run on a root folder with **scope.txt** file inside. A **functionsSelector.md** file with a list of all the function selectors and which functions they belong to is created in the root folder.

# How to run it
1. Clone the repo.
2. Run **npm i**
3. Run the following:
   
   ```jsx
   npm run getSignatures pathToRootFolder [visibilityOptions]
   ```
Where **pathToRootFolder** is the relative path to the project you desire to run this script on. A scope.txt file must located inside that root folder.
You can also pass visibilityOptions one after another.

# Visibility options
The script will generate signatures only for the specified visibilities. By default, only *public* and *external* are specified. If you wish to change that, you can provide additional options one after another:

   - ```private-only``` - deletes all other specified visibilities except the *private* one
   - ```internal-only``` - deletes all other specified visibilities except the *internal* one
   - ```public-only``` - deletes all other specified visibilities except the *public* one
   - ```external-only``` - deletes all other specified visibilities except the *external* one

   - ```include-private``` - add *private* visibility to the specified visibilities
   - ```include-internal``` - add *internal* visibility to the specified visibilities
   - ```include-public``` - add *public* visibility to the specified visibilities
   - ```include-external``` - add *external* visibility to the specified visibilities
