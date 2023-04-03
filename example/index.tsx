import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Layout, Tooltip, Modal, Select } from 'antd';
import * as _ from 'lodash';
import LineageDag from '../lib';
import { mockData } from './mock_data/data';
import 'antd/dist/antd.css';
import './index.less';
import { Adapter } from './adapter';
import sourceData from '../data/mock.json';
import { ITargetData } from './types';
import { BorderOuterOutlined, DownSquareOutlined, CloseCircleOutlined, StarOutlined, UpSquareOutlined } from '@ant-design/icons';

const { Header } = Layout;

class Com extends React.Component<{}, ITargetData & any> {
  constructor(props) {
    super(props);
    this.state = {
      tables: [],
      relations: [],
      options: [],
      canvas: null,
      actionMenu: [{
        icon: <StarOutlined />,
        key: 'star',
        onClick: () => {
          this.setState({
            visible: true
          })
        }
      }],
      visible: false,
      initTable: null
    };
    // @ts-ignore
    this.columns = [{
      key: 'name',
      primaryKey: true
    }, {
      key: 'title',
    }] as any[];
    // @ts-ignore
    this.operator = [{
      id: 'isExpand',
      name: '展开',
      icon: <Tooltip title='展开'><BorderOuterOutlined /></Tooltip>,
      onClick: (nodeData) => {
        const tableIndex = this.state.tables.findIndex(item => item.id === nodeData.id);
        const table = this.state.tables[tableIndex];
        table.isCollapse = !!!table.isCollapse;
        this.setState({
          tables: [...this.state.tables],
          centerId: table.id
        });
      }
    }, {
      id: 'explore',
      name: '探索',
      icon: <Tooltip title='探索'><DownSquareOutlined /></Tooltip>,
      onClick: (nodeData) => {
        const tableIndex = this.state.tables.findIndex(item => item.id === nodeData.id);
        const table = this.state.tables[tableIndex] as ITargetData['tables'][number];
        const relations = this.state.relations as ITargetData['relations'];
        const id = table.id;
        relations.forEach(relation => {
          if (relation.srcTableId === id) {
            const targetTable = this.state.tables.find(item => item.id === relation.tgtTableId);
            if (targetTable) {
              targetTable.isExpand = true;
              targetTable.isCollapse = false;
            }
          }
        });
        table.isCollapse = true;
        this.setState({
          tables: [...this.state.tables],
        });
        setTimeout(() => {
          const tableIndex = this.state.tables.findIndex(item => item.id === nodeData.id);
          const table = this.state.tables[tableIndex];
          table.isCollapse = false;
          this.setState({
            tables: [...this.state.tables],
            centerId: table.id
          });
        }, 1000);
      }
    }];
    this.changeSourceData();
  }

  changeSourceData(isNotMock?: boolean) {
    if (!isNotMock) {
      const { tables: sourceTables, relations: sourceRelations } = mockData;
      const tables = _.cloneDeep(sourceTables);
      const relations = _.cloneDeep(sourceRelations);
      this.setState({
        tables,
        relations,
        options: tables.slice(0, 10).map(table => table.name),
      });
    } else {
      const { tables: sourceTables, relations: sourceRelations } = new Adapter().transfer(sourceData);
      const tables = _.cloneDeep(sourceTables);
      const relations = _.cloneDeep(sourceRelations);
      this.setState({
        tables,
        relations,
        options: tables.slice(0, 10).map(table => table.name),
      });
    }
  }

  render() {
    return (
      <>
        <LineageDag
          tables={this.state.tables.filter(table => table.isExpand)}
          relations={this.state.relations}
          // @ts-ignore
          columns={this.columns}
          // @ts-ignore
          operator={this.operator}
          centerId={this.state.centerId}
          onLoaded={(canvas) => {
            this.setState({
              canvas
            });
          }}
          config={{
            titleRender: (title, node) => {
              return <>{title}</>
            },
            minimap: {
              enable: true
            }
          }}
          actionMenu={this.state.actionMenu}
        />
        <Modal
          visible={this.state.visible}
          onCancel={() => {
            this.setState({
              visible: false
            })
          }}
          onOk={() => {
            this.state.tables.forEach(table => {
              table.isExpand = false;
            });
            this.state.initTable.isExpand = true;
            this.setState({
              visible: false,
              tables: [...this.state.tables]
            })
          }}
        >
          <Select
            style={{
              minWidth: '200px'
            }}
            placeholder='search table name'
            showSearch onSearch={(v) => {
              const options = this.state.tables.filter(table => (table.name as string).includes(v)).map(table => table.name).slice(0, 10);
              this.setState({
                options
              });
            }}
            onChange={v => {
              const initTable = this.state.tables.find(table => table.name === v);
              this.setState({
                initTable
              })
            }}
          >
            {this.state.options.map(option => {
              return <Select.Option key={option}>{option}</Select.Option>
            })}
          </Select>
          <Select
            style={{
              minWidth: '200px'
            }}
            placeholder='change source data'
            onChange={v => {
              this.changeSourceData(v !== 'mock');
            }}
          >
            {['mock', 'not mock'].map(option => {
              return <Select.Option key={option}>{option}</Select.Option>
            })}
          </Select>
        </Modal>
      </>
    );
  }
}


ReactDOM.render((
  <Router>
    <Layout>
      <Header className='header'>DTDesign-React数据血缘图</Header>
      <Layout>
        <Com />
      </Layout>
    </Layout>
  </Router>
), document.getElementById('main'));
