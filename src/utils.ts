import { faker } from '@faker-js/faker';
import _, { Dictionary } from 'lodash';
import { DataFields } from './views/HomePage';

interface Hash {
    [key: string]: number;
}

export enum Columns {
    name = "name",
    lastName = "lastName",
    age = 'age' ,
    zip = 'zip' ,
    city = 'city',
    disease = 'disease',
    country = 'country',
    sex = 'sex'
}

type GroupI = Dictionary<{
    name: string;
    lastName: string;
    age: string;
    zip: string;
    city: string;
    disease: string;
    country: string;
    sex: string;
}[]>

export function classJoin(...classes: Array<string | null | undefined | false>) {
    return classes.filter(x => x).join(" ") || undefined;
}

export const generateData = async (n: number) => {
    const data = [];
    const response = await fetch('diseases.json');
    const values = await response.json();

    for (let i = 0; i < n; i++) {
        data.push({
            name: faker.name.firstName(),
            lastName: faker.name.lastName(),
            city: faker.address.cityName(),
            age: Math.floor(Math.random()*98 + 1).toString(),
            zip: faker.address.zipCode(),
            country: faker.address.country(),
            sex: faker.name.sex(),
            disease: values[Math.floor(Math.random()*197)],
        });
    }

    return data;
}

export const countGroupedBy = (columnName: Columns, data: any) => Object.keys(_.groupBy(data, (item) => item[columnName])).length;

const kAnonymizeCondition = (groups: GroupI, k: number) => {
    let thresholdPassed = true;
    for (const prop in groups) {
        if(groups[prop].length < k) {
            thresholdPassed = false;
            break;
        }
    }
    return thresholdPassed;
}

const lDiversifyCondition = (groups: GroupI, l: number) => {
    let thresholdPassed = true;
    for (const prop in groups) {
        let sensitiveColumnDifferentValues: Hash = {};
        let sensitiveColumnDifferentValuesCount = 0;

        groups[prop].forEach(groupEl => {
            if (!sensitiveColumnDifferentValues[groupEl.disease]) sensitiveColumnDifferentValues[groupEl.disease] = 1;
        })

        sensitiveColumnDifferentValuesCount = Object.keys(sensitiveColumnDifferentValues).length;

        if(sensitiveColumnDifferentValuesCount < l) {
            thresholdPassed = false;
            break;
        }
    }
    return thresholdPassed;
}

export const findShortestLengthOfElements = (data: DataFields[], columnName: Columns) => {
    return data.reduce((acc, curr) => { return acc[columnName].length <= curr[columnName].length ? acc : curr;})[columnName].length
}

export const shrinkElementsLengthToShortest = (data: DataFields[], pidColumns: Columns[]) => {
    pidColumns.forEach(columnName => {
        const shortestElementLength = findShortestLengthOfElements(data, columnName);
        const mappedElements = data.map(row =>  {
            const value = row[columnName];
            if(value.length > shortestElementLength) {
                return ({...row, [columnName]: value.slice(0, shortestElementLength)});
            }
            return row; 
        })
        data = mappedElements;
    })
    return data;
}

export const kAnonymize = (data: DataFields[], k: number, pidColumns: Columns[]) => {
    let dataCopy = data.map(el => ({...el}));
    let shrinkedDataCopy = shrinkElementsLengthToShortest(dataCopy, pidColumns);
    dataCopy = JSON.parse(JSON.stringify(shrinkedDataCopy));

    pidColumns.forEach(column => {
        for (let i = 0; i < dataCopy[0][column].length; i++) {
            let groups = _.groupBy(dataCopy, (item) => `${item[column][i]}`);
            // console.log(groups)

            if (!kAnonymizeCondition(groups, k)) {
                for (let j = 0; j < dataCopy.length; j++) {
                    let newVal: string | string[] = dataCopy[j][column].split('');
                    newVal.splice(i, 1, '*');
                    newVal = newVal.join('');
                    dataCopy[j][column] = newVal;
                }
            }
        }
    });

    let bruteForcedData = bruteForceKAnonymize(dataCopy, k, pidColumns);
    return changeStarsToLettersIfPossible(shrinkedDataCopy, bruteForcedData, pidColumns, k, kAnonymizeCondition);
}

export const bruteForceKAnonymize = (data: DataFields[], k: number, pidColumns: Columns[]): DataFields[] => {
    let dataCopy = data.map(el => ({...el}));
    let groups;
    let columnIndex = 0;

    while (true) {
        groups = _.groupBy(dataCopy, item => pidColumns.reduce((acc, curr) => {acc += `${item[curr]}+`; return acc;}, '').slice(0, -1));
        if (kAnonymizeCondition(groups, k)) break;
        // console.log(groups);
        
        let currentPidColumn = pidColumns[columnIndex];

        dataCopy = dataCopy.map(row => {
            let tempRow = JSON.parse(JSON.stringify(row));
            let value = row[currentPidColumn];
            const charsDifferentThanStar = value.split('').filter(el => el !== '*').length;

            if (value.includes('*') && charsDifferentThanStar > 0) value = value.substring(0, value.indexOf('*') - 1) + '*' + value.substring(value.indexOf('*'));
            else if (charsDifferentThanStar) value = value.slice(0, -1) + '*';
            
            tempRow[currentPidColumn] = value;
            return tempRow;
        })
        console.log(dataCopy);

        if (columnIndex + 1 > pidColumns.length - 1) columnIndex = 0;
        else columnIndex++;
    }
    console.log(groups);
    return dataCopy;
}

function getAllIndexes(arr: string[], val: string, index: number) {
    var indexes = [], i;
    for(i = 0; i < arr.length; i++)
        if (arr[i][index] === val)
            indexes.push(i);
    return indexes;
}

function mapColumnValuesOfAllRowsToArray(data: DataFields[], column: Columns) {
    return data.map(row => row[column]);
}

function spliceStr(value: string, newLetter: string, index: number) {
    let newVal: string | string[] = value.split('');
    newVal.splice(index, 1, newLetter);
    return newVal.join('');
}

const exchangeStarForOriginalLetterOnThisPosition = (data: DataFields[], dataAnonymized: DataFields[], index: number, column: Columns, pidColumns: Columns[], param: number, anonymizationCondition: (groups: GroupI, param: number) => boolean) => {
    let dataAnonymizedCopy = dataAnonymized.map(el => ({...el}));
    let originalLettersOnThisPosition = [...new Set(data.map(row => row[column][index]))];

    originalLettersOnThisPosition.forEach(letter => {
        const allRowsValues = mapColumnValuesOfAllRowsToArray(data, column);
        const rowIndexesWithCurrentLetterOnIndexPosition = getAllIndexes(allRowsValues, letter, index);

        let tempData = dataAnonymizedCopy.map((row, rowIdx) => {
            if (rowIndexesWithCurrentLetterOnIndexPosition.includes(rowIdx)) {
                let newVal = spliceStr(row[column], letter, index); 
                return ({...row, [column]: newVal});
            }
            return row;
        })

        let groups = _.groupBy(tempData, item => pidColumns.reduce((acc, curr) => {acc += `${item[curr]}+`; return acc;}, '').slice(0, -1));
        if (column === Columns.name) {
            console.log("LET: ", letter)
            console.log("VALUES: ", groups)
        }
        if (anonymizationCondition(groups, param)) {
            // if (column === Columns.name) console.log('hellO')
            dataAnonymizedCopy = tempData;
        }
    })
    return dataAnonymizedCopy;
}

export const changeStarsToLettersIfPossible = (dataOriginal: DataFields[], dataAnonymized: DataFields[], pidColumns: Columns[], param: number, condition: (groups: GroupI, param: number) => boolean) => {
    let dataAnonymizedCopy = dataAnonymized.map(el => ({...el}));

    pidColumns.forEach(column => {
        if(dataAnonymizedCopy[0][column].includes('*')) {
            const letters = dataAnonymizedCopy[0][column].split('');
            letters.forEach((letter, idx) => {
                if (letter === '*') dataAnonymizedCopy = exchangeStarForOriginalLetterOnThisPosition(dataOriginal, dataAnonymizedCopy, idx, column, pidColumns, param, condition);
            })
        }
    })
    console.log("GROUPS: ", _.groupBy(dataAnonymizedCopy, item => pidColumns.reduce((acc, curr) => {acc += `${item[curr]}+`; return acc;}, '').slice(0, -1)))
    return dataAnonymizedCopy;
}

export const lDiversify = (data: DataFields[], l: number, pidColumns: Columns[]): DataFields[] => {
    let dataCopy = data.map(el => ({...el}));
    let shrinkedDataCopy = shrinkElementsLengthToShortest(dataCopy, pidColumns);
    dataCopy = JSON.parse(JSON.stringify(shrinkedDataCopy));

    let groups;
    let columnIndex = 0;

    while (true) {
        groups = _.groupBy(dataCopy, item => pidColumns.reduce((acc, curr) => {acc += `${item[curr]}+`; return acc;}, '').slice(0, -1));
        if (lDiversifyCondition(groups, l)) break;
        
        let currentPidColumn = pidColumns[columnIndex];

        dataCopy = dataCopy.map(row => {
            let tempRow = JSON.parse(JSON.stringify(row));
            let value = row[currentPidColumn];
            if (typeof value === 'string') {
                const charsDifferentThanStar = value.split('').filter(el => el !== '*').length;
                if (value.includes('*') && charsDifferentThanStar > 0) value = value.substring(0, value.indexOf('*') - 1) + '*' + value.substring(value.indexOf('*'));
                else if (charsDifferentThanStar) value = value.slice(0, -1) + '*';
                tempRow[currentPidColumn] = value;
            }
            return tempRow;
        })
        console.log(dataCopy);

        if (columnIndex + 1 > pidColumns.length - 1) columnIndex = 0;
        else columnIndex++;
    }
    console.log(groups);
    return changeStarsToLettersIfPossible(shrinkedDataCopy, dataCopy, pidColumns, l, lDiversifyCondition);
}
