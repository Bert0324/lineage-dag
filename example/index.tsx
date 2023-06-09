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
import { BorderOuterOutlined, DownSquareOutlined, StarOutlined, UploadOutlined, ShrinkOutlined, ArrowsAltOutlined, RetweetOutlined } from '@ant-design/icons';
import { t } from './utils/i18n';

const { Header } = Layout;

class Com extends React.Component<{}, ITargetData & any> {
  constructor(props) {
    super(props);
    this.state = {
      allCollapse: false,
      tables: [],
      sourceTable: [],
      relations: [],
      options: [],
      canvas: null,
      actionMenu: [{
        icon: <StarOutlined />,
        key: 'star',
        title: 'select',
        onClick: () => {
          this.setState({
            visible: true
          })
        }
      },{
        icon: <ShrinkOutlined />,
        key: 'eee',
        title: 'expand all',
        onClick: () => {
          this.state.tables.forEach(table => {
            table.isCollapse = !!this.state.allCollapse;
          });
          this.setState({
            tables: [...this.state.tables],
            allCollapse: !this.state.allCollapse
          });
        }
      },
      {
        icon: <RetweetOutlined />,
        key: 'eee',
        title: 'explore all',
        onClick: () => {
          if (this.state.initTable) {
            const initNext = this.findNode(this.state.initTable, true);
            const cache = [this.state.initTable.id];
            const search = (list) => {
              list.forEach(id => {
                if (!cache.includes(id)) {
                  const table = this.state.tables.find(item => item.id === id);
                  cache.push(id);
                  const next = this.findNode(table, true);
                  const v = next.filter(item => !cache.includes(item));
                  search(v);
                }
              });
            };
            search(initNext);
          }
        }
      }
    ],
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
      name: t('expand'),
      icon: <Tooltip title={t('expand')}><BorderOuterOutlined /></Tooltip>,
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
      name: t('explore'),
      icon: <Tooltip title={t('explore')}><DownSquareOutlined /></Tooltip>,
      onClick: (nodeData) => {
        this.findNode(nodeData);
      }
      }
    ];
  }

  findNode(nodeData, forceCollapse?: boolean) {
    const tableIndex = this.state.tables.findIndex(item => item.id === nodeData.id);
    const table = this.state.tables[tableIndex] as ITargetData['tables'][number];
    const relations = this.state.relations as ITargetData['relations'];
    const id = table.id;
    const newNode = [];
    relations.forEach(relation => {
      if (relation.srcTableId === id) {
        const targetTable = this.state.tables.find(item => item.id === relation.tgtTableId);
        if (targetTable) {
          targetTable.isExpand = true;
          targetTable.isCollapse = false;
          if (!newNode.includes(targetTable.id)) {
            newNode.push(targetTable.id);
          }
        }
      }
      if (relation.tgtTableId === id) {
        const targetTable = this.state.tables.find(item => item.id === relation.srcTableId);
        if (targetTable) {
          targetTable.isExpand = true;
          targetTable.isCollapse = false;
          if (!newNode.includes(targetTable.id)) {
            newNode.push(targetTable.id);
          }
        }
      }
    });
    table.isCollapse = false;
    const tables = [...this.state.tables];
    this.setState({
      tables: tables.map(item => ({ ...item, isCollapse: true })),
    });
    if (!forceCollapse) {
      setTimeout(() => {
        this.setState({
          tables,
          centerId: table.id
        });
      }, 1000);
    }
    return newNode;
  }

  changeSourceData() {
    const update = (source) => {
      const { tables, relations } = new Adapter().transfer(source);
      const sourceTable = _.cloneDeep(tables);
      const options = tables.slice(0, 10).map(table => table.name);
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

document.title = t('title');
ReactDOM.render((
  <Router>
    <Layout>
      <Header className='header'>{t('title')}</Header>
      <Layout>
        <Com />
      </Layout>
    </Layout>
  </Router>
), document.getElementById('main'));
