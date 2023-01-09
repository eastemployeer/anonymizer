import { faker } from '@faker-js/faker';
import _ from 'lodash';
import { DataFields } from './views/HomePage';

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
            disease: values[Math.floor(Math.random()*4971)],
        });
    }

    return data;
}

export const generateNames = (n: number) => {
    const names = [];
    for (let i = 0; i < n; i++) {
        names.push(faker.name.firstName());
    }
    return names;
}

export const generateLastNames = (n: number) => {
    const lastNames = [];
    for (let i = 0; i < n; i++) {
        lastNames.push(faker.name.lastName());
    }
    return lastNames;
}

export const generateCities = (n: number) => {
    const cities = [];
    for (let i = 0; i < n; i++) {
        cities.push(faker.address.cityName());
    }
    return cities;
}

export const generateAges = (n: number) => {
    const ages = [];
    for (let i = 0; i < n; i++) {
        ages.push(Math.floor(Math.random()*99));
    }
    return ages;
}

export const generateZip = (n: number) => {
    const zip = [];
    for (let i = 0; i < n; i++) {
        zip.push(faker.address.zipCode());
    }
    return zip;
}

export const generateCountry = (n: number) => {
    const countries = [];
    for (let i = 0; i < n; i++) {
        countries.push(faker.address.country());
    }
    return countries;
}

export const generateSex = (n: number) => {
    const sexes = [];
    for (let i = 0; i < n; i++) {
        sexes.push(faker.name.sex());
    }
    return sexes;
}

export const generateDisease = async (n: number) => {
    const diseases = [];
    const response = await fetch('diseases.json');
    const values = await response.json();

    for (let i = 0; i < n; i++) {
        diseases.push(values[Math.floor(Math.random()*4971)]);
    }

    return diseases;
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

export const countGroupedBy = (columnName: Columns, data: any) => {
    return Object.keys(_.groupBy(data, (item) => item[columnName])).length;
}

export const shrinkElementsLengthToShortest = (data: DataFields[], pidColumns: Columns[]) => {
    pidColumns.forEach(columnName => {
        if (typeof data[0][columnName] === 'string') {
            const shortestElementLength = ((data.reduce(function(a, b) { return (a[columnName] as string).length <= (b[columnName] as string).length ? a : b;}))[columnName] as string).length
            const mappedElements = data.map(row =>  {
                const value = row[columnName]
                if(typeof value === 'string' && value.length > shortestElementLength) {
                    return ({...row, [columnName]: value.slice(0, shortestElementLength)});
                }
                return row; 
            })
            data = mappedElements;
        }
    })
    return data;
}

export const kAnonymize2 = (data: DataFields[], k: number, pidColumns: Columns[]) => {
    let dataCopy = data.map(el => ({...el}));
    dataCopy = shrinkElementsLengthToShortest(dataCopy, pidColumns);

    // console.log(dataCopy)

    pidColumns.forEach(column => {
        for (let i = 0; i < dataCopy[0][column].length; i++) {
            let groups = _.groupBy(dataCopy, (item) => `${item[column][i]}`);
            console.log(groups)
            let groupUnderThresholdExists = false;
            for (const prop in groups) {
                if(groups[prop].length < k) {
                    console.log(groups[prop])
                    groupUnderThresholdExists = true;
                    break;
                }
            }
            if (groupUnderThresholdExists) {
                for (let j = 0; j < dataCopy.length; j++) {
                    let newVal: string | string[] = dataCopy[j][column].split('');
                    newVal.splice(i, 1, '*');
                    newVal = newVal.join('');
                    dataCopy[j][column] = newVal;
                }
              
                // dataCopy = dataCopy.map(row => {
                //     console.log(row[column])
                //     console.log("I: ", i)
                //     console.log(row[column].split('').splice(1, 1, 'x'))
                //     return ({...row, [column]: row[column].split('').splice(i, 1, '*').join('')})
                // });
            }
        }
    });

    return bruteForceKAnonymize(dataCopy, k, pidColumns);
}

export const bruteForceKAnonymize = (data: DataFields[], k: number, pidColumns: Columns[]): DataFields[] => {
    let dataCopy = data.map(el => ({...el}));
    let groups;
    let columnIndex = 0;

    while (true) {
        groups = _.groupBy(dataCopy, item => pidColumns.reduce((acc, curr) => {acc += `${item[curr]}+`; return acc;}, '').slice(0, -1));
        let thresholdPassed = true;
        for (const prop in groups) {
            if(groups[prop].length < k) {
                thresholdPassed = false;
                break;
            }
        }
        if (thresholdPassed) break;
        console.log(groups);
        
        let currentPidColumn = pidColumns[columnIndex] as Columns;

        // eslint-disable-next-line no-loop-func
        dataCopy = dataCopy.map((row, idx, arr) => {
            let tempRow = JSON.parse(JSON.stringify(row));
            let value = row[currentPidColumn];
            if (typeof value === 'string') {
                // const groupsFormedBySpecificLetter = _.groupBy(arr, item => `${item[currentPidColumn]}`.split('')[pidColumnsIndexTracker[columnIndex]])
                const charsDifferentThanStar = value.split('').filter(el => el !== '*').length;
                if (value.includes('*') && charsDifferentThanStar > 0) value = value.substring(0, value.indexOf('*') - 1) + '*' + value.substring(value.indexOf('*'));
                else if (charsDifferentThanStar) value = value.slice(0, -1) + '*';
                tempRow[currentPidColumn] = value;
            }
            return tempRow;
        })
        console.log(dataCopy);

        if (columnIndex + 1 > pidColumns.length - 1) {
            columnIndex = 0;
        } else columnIndex++;
    }
    console.log(groups);
    return dataCopy;
}

export const lDiversify = (data: DataFields[], k: number, pidColumns: Columns[]): DataFields[] => {
    let dataCopy = data.map(el => ({...el}));
    dataCopy = shrinkElementsLengthToShortest(dataCopy, pidColumns);
}

export const kAnonymize = (data: DataFields[], k: number, pidColumns: Columns[]): DataFields[] => {
    let dataCopy = data.map(el => ({...el}));

    dataCopy = shrinkElementsLengthToShortest(dataCopy, pidColumns);

    let groups;

    let columnIndex = 0;

    while (true) {
        groups = _.groupBy(dataCopy, item => pidColumns.reduce((acc, curr) => {acc += `${item[curr]}+`; return acc;}, '').slice(0, -1));
        let thresholdPassed = true;
        for (const prop in groups) {
            if(groups[prop].length < k) {
                thresholdPassed = false;
                break;
            }
        }
        if (thresholdPassed) break;
        console.log(groups);
        
        let currentPidColumn = pidColumns[columnIndex] as Columns;

        // eslint-disable-next-line no-loop-func
        dataCopy = dataCopy.map((row, idx, arr) => {
            let tempRow = JSON.parse(JSON.stringify(row));
            let value = row[currentPidColumn];
            if (typeof value === 'string') {
                // const groupsFormedBySpecificLetter = _.groupBy(arr, item => `${item[currentPidColumn]}`.split('')[pidColumnsIndexTracker[columnIndex]])
                const charsDifferentThanStar = value.split('').filter(el => el !== '*').length;
                if (value.includes('*') && charsDifferentThanStar > 0) value = value.substring(0, value.indexOf('*') - 1) + '*' + value.substring(value.indexOf('*'));
                else if (charsDifferentThanStar) value = value.slice(0, -1) + '*';
                tempRow[currentPidColumn] = value;
            }
            return tempRow;
        })
        console.log(dataCopy);

        if (columnIndex + 1 > pidColumns.length - 1) {
            columnIndex = 0;
        } else columnIndex++;
    }
    console.log(groups);
    return dataCopy;
}




