const fs = require('fs/promises');
const path = require('node:path');
const keccak256 = require('keccak256');

type Visibility = 'public' | 'external' | 'private' | 'internal';
type ResultsTable = {
    [key: string]: string[],
}

const pathToDir = process.argv[2];
const visibilityConfigs = process.argv.slice(3);

const functionRegex =
  /function[\s\n]+(\w+)[\s\n]*(\((?:[\s\n]*\w+[\s\n]+\w+[\s\n]*,?)*\))[\s\n]+(\w+)/;
const globalFunctionRegex = new RegExp(functionRegex, 'g');

const VISIBILITY_CONFIG_INCLUDE_PRIVATE = 'include-private';
const VISIBILITY_CONFIG_INCLUDE_INTERNAL = 'include-internal';
const VISIBILITY_CONFIG_INCLUDE_PUBLIC = 'include-public';
const VISIBILITY_CONFIG_INCLUDE_EXTERNAL = 'include-external';

const VISIBILITY_CONFIG_PRIVATE_ONLY = 'private-only';
const VISIBILITY_CONFIG_INTERNAL_ONLY = 'internal-only';
const VISIBILITY_CONFIG_PUBLIC_ONLY = 'public-only';
const VISIBILITY_CONFIG_EXTERNAL_ONLY = 'external-only';

const configuredVisibility = handleVisibilityConfig();
const resultsTable: ResultsTable = {};

async function getSignatures(pathToDir: string) {
  const pathSegments = pathToDir.split('/');
  const constructedPath = path.resolve(...pathSegments);
  const files = await fs.readdir(constructedPath);

  files.forEach(async (fileName: string) => {
    const contents = (
      await fs.readFile(path.join(constructedPath, fileName))
    ).toString();
    const functions = contents.match(globalFunctionRegex);
    if (!functions) return;

    functions.forEach((fn: string) => {
      const matchResult = fn.match(functionRegex);
      if (!matchResult) return;

      const functionName = matchResult[1];
      const visibility = matchResult[3] as Visibility;

      if (skipForVisibility(visibility)) return;

      // remove new lines and spaces before and after the parameters list
      let functionParams = matchResult[2]
        .trim()
        .replace(/\r|\n/g, '')
        .replace(/\s+(?=\w+)[^,](?=[,\)])/g, '');
      functionParams = '(' + functionParams.slice(1, -1).trim() + ')';

      // remove parameters names and all spaces in-between
      functionParams = functionParams
        .split(',')
        .map((param) => param.trim().split(/\s+/)[0])
        .join(',');
      // add ")" if cut earlier
      functionParams =
        functionParams[functionParams.length - 1] === ')'
          ? functionParams
          : functionParams + ')';


      const functionSig = functionName + functionParams;
      const hash = '0x' + keccak256(functionSig).toString('hex').slice(0, 8);
      
      const functionLocation = fileName.slice(0, -3) + matchResult[1] + matchResult[2];

      resultsTable[hash] =  [...(resultsTable[hash] || []), functionLocation];
    });

    console.log(resultsTable);
  });
}

function handleVisibilityConfig() {
  const includedVisibilities = new Set<Visibility>();
  includedVisibilities.add('public');
  includedVisibilities.add('external');

  visibilityConfigs.forEach((visibility) => {
   
    switch (visibility) {
      case VISIBILITY_CONFIG_PRIVATE_ONLY:
        includedVisibilities.clear();
        includedVisibilities.add('private');
        break;

      case VISIBILITY_CONFIG_INTERNAL_ONLY:
        includedVisibilities.clear();
        includedVisibilities.add('internal');
        break;

      case VISIBILITY_CONFIG_PUBLIC_ONLY:
        includedVisibilities.clear();
        includedVisibilities.add('public');
        break;

      case VISIBILITY_CONFIG_EXTERNAL_ONLY:
        includedVisibilities.clear();
        includedVisibilities.add('external');
        break;

      case VISIBILITY_CONFIG_INCLUDE_PRIVATE:
        includedVisibilities.add('private');
        break;

      case VISIBILITY_CONFIG_INCLUDE_INTERNAL:
        includedVisibilities.add('internal');
        break;

      case VISIBILITY_CONFIG_INCLUDE_PUBLIC:
        includedVisibilities.add('public');
        break;

      case VISIBILITY_CONFIG_INCLUDE_EXTERNAL:
        includedVisibilities.add('external');
        break;
    }
  });


  return includedVisibilities;
}

function skipForVisibility(visibility: Visibility) {
    return !configuredVisibility.has(visibility);
}

getSignatures(pathToDir);
