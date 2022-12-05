import { faker } from '@faker-js/faker';

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
    const state = [];
    for (let i = 0; i < n; i++) {
        state.push(faker.address.zipCode());
    }
    return state;
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

interface HashI {
    [key: string]: number;
}

interface PID {
    [key: string]: string[];
}

export const anonymize = (pid: PID, k: number, columnNames: string[], rows: number) => {
    for (const column in pid) {
        const shortestElement = pid[column].reduce(function(a, b) { return a.length <= b.length ? a : b;})
        const mappedElements = pid[column].map(el => el.length > shortestElement.length? el.slice(0, shortestElement.length) : el)
        pid[column] = mappedElements;
        // for (let i = 0; i < shortestElement.length; i++) {
        //     const hash: HashI = {};
        //     mappedElements.forEach(el => {
        //         if (!hash[el]) hash[el] = 1;
        //         else hash[el]++;
        //     })
        //     for (const prop in hash) {
        //         if (hash[prop] < )
        //     }
        // }
    }

    while (true) {
        let thresholdPassed = false;
        const hash: HashI = {};
        const arr = new Array(rows).fill('');
        for (let i = 0; i < rows; i++) {
            for (const column in pid) {
                arr[i] += pid[column][i];
            }
        }
        for (let i = 0; i < rows; i++) {
            if (hash[arr[i]]) hash[arr[i]]++;
            else hash[arr[i]] = 1;
        }

        for (const prop in hash) {
            if (hash[prop] < k) {
                thresholdPassed = false;
                break;
            } else thresholdPassed = true;
        }

        if (thresholdPassed) return 
    }



}