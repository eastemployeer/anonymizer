import React from "react";
import './HomePage.scss';
import { useCallback, useState } from "react";
import { Button, Table, Header } from "semantic-ui-react";
import * as factory from '../utils';

const COLUMNS = ["Name", "Lastname", "City", "Age", "Country", "ZIP", 'Sex', "Disease"];

export default function HomePage() {
    const [names, setNames] = useState<string[]>([]);
    const [lastNames, setLastNames] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [ages, setAges] = useState<number[]>([]);
    const [countries, setCountries] = useState<string[]>([]);
    const [zips, setZips] = useState<string[]>([]);
    const [sexes, setSexes] = useState<string[]>([]);
    const [diseases, setDiseases] = useState<string[]>([]);

    const length = 40;

    const onGenerate = useCallback(async () => {
        setNames(factory.generateNames(40))
        setLastNames(factory.generateLastNames(40))
        setCities(factory.generateCities(40));
        setAges(factory.generateAges(40))
        setCountries(factory.generateCountry(40));
        setZips(factory.generateZip(40));
        setSexes(factory.generateSex(40));
        setDiseases(await factory.generateDisease(40));
    }, [])
    
    const generateRows = useCallback(() => {
        const rows = [];
        for (let i = 0; i < length; i++) {
            rows.push(
            <Table.Row>
                <Table.Cell>{names[i]}</Table.Cell>
                <Table.Cell>{lastNames[i]}</Table.Cell>
                <Table.Cell>{cities[i]}</Table.Cell>
                <Table.Cell>{ages[i]}</Table.Cell>
                <Table.Cell>{countries[i]}</Table.Cell>
                <Table.Cell>{zips[i]}</Table.Cell>
                <Table.Cell>{sexes[i]}</Table.Cell>
                <Table.Cell>{diseases[i]}</Table.Cell>
              </Table.Row>
              )
        }
        return rows;
    }, [cities, countries, names, lastNames, ages, zips, sexes, diseases])


    return (
    <div className="HomePage">
        <div className="headerWrapper">
            <Header>Anonymizer 9000</Header>
            <Button onClick={onGenerate}>Generate data</Button>
        </div>
        <div className="row">
        <Table celled className="column">
            <Table.Header>
            <Table.Row>
                {COLUMNS.map(col => <Table.HeaderCell>{col}</Table.HeaderCell>)}
            </Table.Row>
            </Table.Header>
            <Table.Body>{generateRows()}</Table.Body>
        </Table>
        <Table celled className="column">
            <Table.Header>
            <Table.Row>
                {COLUMNS.map(col => <Table.HeaderCell>{col}</Table.HeaderCell>)}
            </Table.Row>
            </Table.Header>
            <Table.Body></Table.Body>
        </Table>
    </div>
    </div>)
}