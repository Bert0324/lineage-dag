import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Layout, Tooltip, Modal, Select, Upload, Button, message } from 'antd';
import * as _ from 'lodash';
import LineageDag from '../lib';
// import { mockData } from './mock_data/data';
import 'antd/dist/antd.css';
import './index.less';
import { Adapter } from './adapter';
// import sourceData from '../data/mock.json';
import { ITargetData } from './types';
import { BorderOuterOutlined, DownSquareOutlined, StarOutlined, UploadOutlined, ExpandOutlined } from '@ant-design/icons';

const { Header } = Layout;

class Com extends React.Component<{}, ITargetData & any> {
  constructor(props) {
    super(props);
    this.state = {
      tables: [],
      sourceTable: [],
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
      initTable: null,
      file: null,
      isMock: true
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
          if (relation.tgtTableId === id) {
            const targetTable = this.state.tables.find(item => item.id === relation.srcTableId);
            if (targetTable) {
              targetTable.isExpand = true;
              targetTable.isCollapse = false;
            }
          }
        });
        table.isCollapse = false;
        const tables = [...this.state.tables];
        this.setState({
          tables: tables.map(item => ({ ...item, isCollapse: true })),
        });
        setTimeout(() => {
          this.setState({
            tables,
            centerId: table.id
          });
        }, 1000);
      }
      },
      //   {
      //     id: 'showLinks',
      //     name: '折叠',
      //     icon: <Tooltip title='展示所有column'><ExpandOutlined /></Tooltip>,
      //     onClick: (nodeData) => {
      //       const tableIndex = this.state.tables.findIndex(item => item.id === nodeData.id);
      //       const table = this.state.tables[tableIndex] as ITargetData['tables'][number];
      //       if (table.isShowAllColumns) {
      //         table.fields = this.state.
      //       } else {

      //       }
      //       table.isShowAllColumns = !table.isShowAllColumns;
      //       this.setState({
      //         tables: [...this.state.tables],
      //       });
      //   }
      // }
    ];
  }

  changeSourceData() {
    const update = (source) => {
      const { tables, relations } = new Adapter().transfer(source);
      const sourceTable = _.cloneDeep(tables);
      const options = tables.slice(0, 10).map(table => table.name);
      // tables.forEach(table => {
      //   const fields = table.fields.filter(field => {
      //     const match = relations.find(item => {
      //       if (item.srcTableId === table.name && item.srcTableColName === field.name) {
      //         return false;
      //       }
      //       if (item.tgtTableId === table.name && item.tgtTableColName === field.name) {
      //         return false;
      //       }
      //       return true;
      //     });
      //     return !!match;
      //   });
      //   table.fields = fields;
      // });
      this.setState({
        tables,
        sourceTable,
        relations,
        options,
      });
    };
    if (this.state.file) {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          // this will then display a text file
          try {
            const v = JSON.parse(reader.result.toString());
            update(v);
            localStorage.setItem('sourceJSON', reader.result.toString());
          } catch (e) {
            console.log(e);
            message.error(`invalid json file: ${e}`);
          }
        },
        false
      );
      reader.readAsText(this.state.file);
    } else {
      try {
        // @ts-ignore
        const v = JSON.parse(window.inlineSource || localStorage.getItem('sourceJSON'));
        update(v);
      } catch (e) {
        console.log(e);
        message.warn('not init source data')
      }
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
            this.changeSourceData();
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
            });
          }}
        >
          <Upload beforeUpload={(file) => {
            this.setState({
              file
            });
            setTimeout(() => {
              this.changeSourceData();
            })
          }} onRemove={() => {
            this.setState({
              file: null
            });
          }} multiple={false} fileList={[this.state.file].filter(Boolean)}>
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
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
