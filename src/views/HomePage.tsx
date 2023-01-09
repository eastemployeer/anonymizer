import React, { useMemo } from "react";
import { useCallback, useState } from "react";
import { Button, Table, Header, Icon, Pagination, PaginationProps, Modal, Form, Checkbox, Segment, Select, Input, DropdownProps, InputOnChangeData, Dropdown } from "semantic-ui-react";
import * as factory from '../utils';
import useOpen from "../hooks/useOpen";
import Card from "../components/Card";
import _ from 'lodash';
import './HomePage.scss';

const COLUMNS = ["Name", "Lastname", "City", "Age", "Country", "ZIP", 'Sex', "Disease"];
const ANONYMIZATION_OPTIONS = [
    { key: 'k', value: 'k', text: 'K-Anonymization' },
    { key: 'l', value: 'l', text: 'L-Diversification' },
];
const RECORDS_AMOUNT = 5000;
const PAGE_SIZE = 25;

export interface DataFields {
    name: string;
    lastName: string;
    age: string;
    zip: string;
    city: string;
    disease: string;
    country: string;
    sex: string;
}

type PIDProps = {
    [key in factory.Columns]: boolean;
}

export default function HomePage() {
    const [parameter, setParameter] = useState(2);
    const [anonymizationOption, setAnonymizationOption] = useState();
    const [data, setData] = useState<DataFields[] | null>(null);
    const [sorted, setSorted] = useState(false);
    const [sortedAnonymizedData, setSortedAnonymizedData] = useState<DataFields[] | null>(null)
    const [anonymizedData, setAnonymizedData] = useState<DataFields[] | null>(null);
    const [PID, setPID] = useState<PIDProps>({name: false, lastName: false, age: false, zip: false, city: false, disease: false, country: false, sex: false})
    const [activePage, setActivePage] = useState(1);
    const PIDValues = useMemo(() => {
        const values: factory.Columns[]  = [];
        for (const prop in PID) {
            if (PID[prop as factory.Columns]) values.push(prop as factory.Columns)
        }
        return values;
    }, [PID]); 

    const onGenerate = useCallback(async () => {
        setData(await factory.generateData(RECORDS_AMOUNT));
        setAnonymizedData(null);
    }, [])

    const onSortByGroups = useCallback(() => {
        setSorted(!sorted);
    }, [sorted])

    const onAnonymize = useCallback(() => {
        console.log(anonymizationOption)
        if (data === null) return;
        if (anonymizationOption === 'k') {
            const anonData = factory.kAnonymize2(data, parameter, PIDValues); 
            setSortedAnonymizedData(Object.values(_.groupBy(anonData, item => PIDValues.reduce((acc, curr) => {acc += `${item[curr]}+`; return acc;}, '').slice(0, -1))).flat())
            setAnonymizedData(anonData);
        }
        if (anonymizationOption === 'l') return;
    }, [data, PIDValues, anonymizationOption, parameter])

    const onPageChange = useCallback((event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, data: PaginationProps) => {
        if (data.activePage) setActivePage(Number(data.activePage));
    }, [])

    const onChange = useCallback((event: any, data: any) => {
        const {name} = event.target;
        if (name === 'anonymizationParameter') setParameter(data.value);
        else setAnonymizationOption(data.value);
    }, [])
    
    const generateRows = useCallback((data: DataFields[] | null) => {
        const rows = [];
        const offset = PAGE_SIZE*(activePage - 1);
        if (data) {
            for (let i = 0 + offset; i < offset + PAGE_SIZE; i++) {
                if (!data[i]) break;

                rows.push(
                <Table.Row>
                    <Table.Cell>{data[i].name}</Table.Cell>
                    <Table.Cell>{data[i].lastName}</Table.Cell>
                    <Table.Cell>{data[i].city}</Table.Cell>
                    <Table.Cell>{data[i].age}</Table.Cell>
                    <Table.Cell>{data[i].country}</Table.Cell>
                    <Table.Cell>{data[i].zip}</Table.Cell>
                    <Table.Cell>{data[i].sex}</Table.Cell>
                    <Table.Cell>{data[i].disease}</Table.Cell>
                  </Table.Row>
                )
            }
        }
        return rows;
    }, [activePage])

    return (
    <div className="HomePage">
        <div className="headerWrapper">
            <Header>Anonymizer 9000</Header>
            <div className="actionWrapper">
            <Form className="row">
                <Form.Field>
                    <label>Select anonymization option</label>
                    <Select placeholder='Select anonymization option' name="anonymizationOptions" defaultValue={parameter} onChange={onChange} options={ANONYMIZATION_OPTIONS} />
                </Form.Field>
                <Form.Field>
                    <label>Specify parameter</label>
                    <Input type="number" name="anonymizationParameter" onChange={onChange} />
                </Form.Field>
            </Form>
            <div className="row">
                <Button onClick={onGenerate}>Generate data</Button>
                <Button onClick={onAnonymize}>Anonymize</Button>
            </div>
            <div className="row">
                <PIDModal setData={setPID} data={PID} />
                <HierarchyModal PIDValues={PIDValues} data={data} />
            </div>
            {data && 
                <div className="paginationWrapper row">
                    <Pagination
                        activePage={activePage}
                        boundaryRange={1}
                        onPageChange={onPageChange}
                        size='mini'
                        siblingRange={1}
                        totalPages={Math.ceil(data.length / PAGE_SIZE)} />
                    {anonymizedData && <Button onClick={onSortByGroups} icon="filter" content="Change sorting type" />}
                </div>
            }
            </div>
        </div>
        <div className="row tableRow">
            <Table celled className="column">
                <Table.Header>
                <Table.Row>
                    {COLUMNS.map(col => <Table.HeaderCell>{col}</Table.HeaderCell>)}
                </Table.Row>
                </Table.Header>
                <Table.Body>{generateRows(data)}</Table.Body>
            </Table>
            <Table celled className="column">
                <Table.Header>
                <Table.Row>
                    {COLUMNS.map(col => <Table.HeaderCell>{col}</Table.HeaderCell>)}
                </Table.Row>
                </Table.Header>
                <Table.Body>{generateRows(sorted ? sortedAnonymizedData : anonymizedData)}</Table.Body>
            </Table>
        </div>
    </div>)
}

interface PIDModalProps {
    data: PIDProps;
    setData: (data: PIDProps) => void;
}
function PIDModal({data, setData}: PIDModalProps) {
    const {open, onOpen, onClose} = useOpen();
    const [tempData, setTempData] = useState<PIDProps>(data);

    const onChange = useCallback((name: factory.Columns) => {
        setTempData((prevState) => ({...prevState, [name]: !prevState[name]}))
    }, [])

    const onSubmit = useCallback(() => {
        setData(tempData);
        onClose();
    }, [setData, tempData, onClose])

    const onCancel = useCallback(() => {
        setTempData(data);
        onClose();
    }, [data, onClose]);

    return (
        <Modal onClose={onClose} onOpen={onOpen} open={open} size='mini' trigger={<Button>Set PID</Button>}>
        <Modal.Header>Select columns for PID</Modal.Header>
        <Modal.Content>
            <div className="checkboxesWrapper">
                {Object.keys(factory.Columns).map(column => <Form.Checkbox label={column} 
                                                                        checked={tempData[column as factory.Columns]} 
                                                                        onChange={() => onChange(column as factory.Columns)}/>)}
            </div>
        </Modal.Content>
        <Modal.Actions>
            <Button color='red' inverted onClick={onCancel}>
            <Icon name='remove' /> No
            </Button>
            <Button color='green' inverted onClick={onSubmit}>
            <Icon name='checkmark' /> Submit
            </Button>
        </Modal.Actions>
        </Modal>
    )
}

interface HierarchyModalProps {
    PIDValues: factory.Columns[];
    data: DataFields[] | null;
}

const DIFFERENT_VALUES_THRESHOLD = 100;

type HierarchyDataProps = {
    [key in factory.Columns]: Array<Array<{
        values: string[];
        newValue: string;
    }>>
}

const mapAndSortRowsData = (data: string[]) => {
    return data.map(el => mapStringToDropdownProps(el)).sort((a,b) => {
        if (a.value < b.value) return -1;
        if (a.value > b.value) return 1;
        return 0;
    });
}

const mapStringToDropdownProps = (el: string) => ({key: el.toString(), value: el.toString(), text: el.toString()});

function HierarchyModal({PIDValues, data}: HierarchyModalProps) {
    const {open, onOpen, onClose} = useOpen();
    const [selectedColumn, setSelectedColumn] = useState<factory.Columns>();
    const [hierarchyData, setHierarchyData] = useState<HierarchyDataProps>();
    const [currentHierarchyLevel, setCurrentHierarchyLevel] = useState(0);
    const [anonymizedValuesNumber, setAnonymizedValuesNumber] = useState(1);

    const onAnonymizedValuesNumberChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        setAnonymizedValuesNumber(+data.value);
    }, [])

    const onColumnChange = useCallback((value: factory.Columns) => {
        setSelectedColumn(value);
    }, [])

    const generateInputs = useCallback(() => {
        if (!selectedColumn) return;
        let values = mapAndSortRowsData([...new Set(data?.map(row => row[selectedColumn]))]);
        let inputs = [];
        for (let i = 0; i < anonymizedValuesNumber; i++) {
            inputs.push(
                <Table.Row>
                    <Table.Cell><Input /></Table.Cell>
                    <Table.Cell>All values</Table.Cell>
                </Table.Row>
            )
        }
    }, [anonymizedValuesNumber])

    let content;

    if (selectedColumn && (factory.countGroupedBy(selectedColumn, data) > DIFFERENT_VALUES_THRESHOLD)) {
        content = (
            <>
                <Header>Too many different values. Default anonymization technique is used</Header>
                <Table celled className="column">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Anonymized value</Table.HeaderCell>
                            <Table.HeaderCell>Original values</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>Default anonymization technique (*)</Table.Cell>
                            <Table.Cell>All values</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </>
        )
    } else if (selectedColumn) {
        let values = mapAndSortRowsData([...new Set(data?.map(row => row[selectedColumn]))]);
        content = (
            <>
                <div className="row">
                    <label>How many anonymized values in this hierarchy level?</label>
                    <Input type="number" onChange={onAnonymizedValuesNumberChange}/>
                </div>
                <Table celled className="column">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Anonymized value</Table.HeaderCell>
                            <Table.HeaderCell>Original values</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell><Input /></Table.Cell>
                            <Table.Cell><Dropdown selection options={values} /></Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </>
        )
    }

    return (
        <Modal onClose={onClose} onOpen={onOpen} open={open} size='small' trigger={<Button>Create custom hierarchies</Button>}>
        <Modal.Header>Define hierarchy for PID</Modal.Header>
        <Modal.Content>
        <Segment tertiary>
            <Card.Group>
            {PIDValues.map(value => <Card centered link header={value} active={value === selectedColumn} onClick={() => onColumnChange(value)} />
            )}
            </Card.Group>
        </Segment>
        <Segment>
            {content}
        </Segment>
     
        </Modal.Content>
        <Modal.Actions>
            <Button color='red' inverted onClick={onClose}>
            <Icon name='remove' /> No
            </Button>
            <Button color='green' inverted onClick={onClose}>
            <Icon name='checkmark' /> Submit
            </Button>
        </Modal.Actions>
        </Modal>
    )
}