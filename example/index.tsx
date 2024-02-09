import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import {
  Layout,
  Tooltip,
  Modal,
  Select,
  Upload,
  Button,
  message,
  Popover,
} from "antd";
import * as _ from "lodash";
import LineageDag from "../lib";
// import { mockData } from './mock_data/data';
import "antd/dist/antd.css";
import "./index.less";
import { Adapter } from "./adapter";
// import sourceData from '../data/mock.json';
import { ITargetData } from "./types";
import {
  BorderOuterOutlined,
  DownSquareOutlined,
  StarOutlined,
  UploadOutlined,
  ShrinkOutlined,
  ArrowsAltOutlined,
  RetweetOutlined,
  ConsoleSqlOutlined,
} from "@ant-design/icons";
import { t } from "./utils/i18n";
import Link from "antd/lib/typography/Link";
import { AdapterV2 } from "./adapter/v2";
const { Header } = Layout;

class Com extends React.Component<{}, ITargetData & any> {
  constructor(props) {
    super(props);
    this.state = {
      sql: <></>,
      allCollapse: false,
      tables: [],
      sourceTable: [],
      relations: [],
      options: [],
      canvas: null,
      actionMenu: [
        {
          icon: <StarOutlined />,
          key: "star",
          title: "select",
          onClick: () => {
            this.setState({
              visible: true,
            });
          },
        },
        {
          icon: <ShrinkOutlined />,
          key: "expand",
          title: "expand all",
          onClick: () => {
            this.state.tables.forEach((table) => {
              table.isCollapse = !!this.state.allCollapse;
            });
            this.setState({
              tables: [...this.state.tables],
              allCollapse: !this.state.allCollapse,
            });
          },
        },
        {
          icon: <RetweetOutlined />,
          key: "explore",
          title: "explore all",
          onClick: () => {
            if (this.state.initTable) {
              const initNext = this.findNode(this.state.initTable, true);
              const cache = [this.state.initTable.id];
              const search = (list) => {
                list.forEach((id) => {
                  if (!cache.includes(id)) {
                    const table = this.state.tables.find(
                      (item) => item.id === id
                    );
                    cache.push(id);
                    const next = this.findNode(table, true);
                    const v = next.filter((item) => !cache.includes(item));
                    search(v);
                  }
                });
              };
              search(initNext);
            }
          },
        },
      ],
      visible: false,
      initTable: null,
      file: null,
      isMock: true,
    };
    // @ts-ignore
    this.columns = [
      {
        key: "name",
        primaryKey: true,
      },
      {
        key: "title",
      },
    ] as any[];
    // @ts-ignore
    this.operator = [
      {
        id: "viewSql",
        name: t("viewSql"),
        icon: (
          <Popover
            content={<div className="sqlContent">{this.state.sql}</div>}
            trigger="click"
          >
            <ConsoleSqlOutlined />
          </Popover>
        ),
        onClick: (nodeData) => {
          const tableIndex = this.state.tables.findIndex(
            (item) => item.id === nodeData.id
          );
          const table = this.state.tables[tableIndex];
          setTimeout(() => {
            const elements = Array.from(
              document.getElementsByClassName("sqlContent")
            );
            const element = elements.find((e: any) => !!e.offsetParent);
            if (element) {
              element.textContent = table.sql;
            }
          });
        },
      },
      {
        id: "isExpand",
        name: t("expand"),
        icon: (
          <Tooltip title={t("expand")}>
            <BorderOuterOutlined />
          </Tooltip>
        ),
        onClick: (nodeData) => {
          const tableIndex = this.state.tables.findIndex(
            (item) => item.id === nodeData.id
          );
          const table = this.state.tables[tableIndex];
          table.isCollapse = !!!table.isCollapse;
          this.setState({
            tables: [...this.state.tables],
            centerId: table.id,
          });
        },
      },
      {
        id: "explore",
        name: t("explore"),
        icon: (
          <Tooltip title={t("explore")}>
            <DownSquareOutlined />
          </Tooltip>
        ),
        onClick: (nodeData) => {
          this.findNode(nodeData);
        },
      },
    ];
  }

  findNode(nodeData, forceCollapse?: boolean) {
    const tableIndex = this.state.tables.findIndex(
      (item) => item.id === nodeData.id
    );
    const table = this.state.tables[
      tableIndex
    ] as ITargetData["tables"][number];
    const relations = this.state.relations as ITargetData["relations"];
    const id = table.id;
    const newNode = [];
    relations.forEach((relation) => {
      if (relation.srcTableId === id) {
        const targetTable = this.state.tables.find(
          (item) => item.id === relation.tgtTableId
        );
        if (targetTable) {
          targetTable.isExpand = true;
          targetTable.isCollapse = false;
          if (!newNode.includes(targetTable.id)) {
            newNode.push(targetTable.id);
          }
        }
      }
      if (relation.tgtTableId === id) {
        const targetTable = this.state.tables.find(
          (item) => item.id === relation.srcTableId
        );
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
      tables: tables.map((item) => ({ ...item, isCollapse: true })),
    });
    if (!forceCollapse) {
      setTimeout(() => {
        this.setState({
          tables,
          centerId: table.id,
        });
      }, 1000);
    }
    return newNode;
  }

  changeSourceData() {
    const update = (source) => {
      const { tables, relations } = new AdapterV2().transfer(source);
      const sourceTable = _.cloneDeep(tables);
      const options = tables.slice(0, 10).map((table) => table.name);
      this.setState({
        tables,
        sourceTable,
        relations,
        options,
      });
    };
    this.setState({
      initTable: undefined,
    });
    if (this.state.file) {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          // this will then display a text file
          try {
            const v = JSON.parse(reader.result.toString());
            update(v);
            localStorage.setItem("sourceJSON", reader.result.toString());
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
        const v = JSON.parse(
          (window as any).inlineSource || localStorage.getItem("sourceJSON")
        );
        update(v);
      } catch (e) {
        console.log(e);
        message.warn("not init source data");
      }
    }
  }

  confirmTable() {
    this.state.tables.forEach((table) => {
      table.isExpand = false;
    });
    this.state.initTable.isExpand = true;
    const tables = [...this.state.tables];
    this.setState({
      visible: false,
      tables: tables.map((item) => ({ ...item, isCollapse: true })),
    });
    setTimeout(() => {
      this.setState({
        tables,
        centerId: this.state.initTable.id,
      });
    }, 1000);
  }

  getSelect(change?: boolean) {
    return (
      <Select
        style={{
          minWidth: "200px",
        }}
        value={this.state.initTable?.id}
        placeholder="search table name"
        showSearch
        onSearch={(v) => {
          const options = this.state.tables
            .filter((table) => (table.name as string).includes(v))
            .map((table) => table.name)
            .slice(0, 100);
          this.setState({
            options,
          });
        }}
        onChange={(v) => {
          const initTable = this.state.tables.find((table) => table.name === v);
          this.setState({
            initTable,
          });
          setTimeout(() => {
            if (change) {
              this.confirmTable();
            }
          });
        }}
      >
        {this.state.options.map((option) => {
          return (
            <Select.Option key={option}>
              {option}
              {` (${
                this.state.tables.find((item) => item.name === option)?.fields
                  ?.length
              })`}
            </Select.Option>
          );
        })}
      </Select>
    );
  }

  getUpload() {
    return (
      <Upload
        showUploadList={false}
        beforeUpload={(file) => {
          this.setState({
            file,
          });
          setTimeout(() => {
            this.changeSourceData();
          });
        }}
        onRemove={() => {
          this.setState({
            file: null,
          });
        }}
        multiple={false}
        fileList={[this.state.file].filter(Boolean)}
      >
        <Button icon={<UploadOutlined />}>
          {t("selectFile")}{" "}
          {this.state.file?.name
            ? `${t("crrFile")}${this.state.file?.name}`
            : ""}
        </Button>
      </Upload>
    );
  }

  render() {
    return (
      <Router>
        <Layout>
          <Header className="header">
            <div className="headerLine">
              <div className="headerLineFirst">
                <div style={{ marginRight: "20px" }}>{t("title")}</div>
                <div style={{ marginRight: "20px" }}>{this.getUpload()}</div>
                {this.getSelect(true)}
              </div>
              <div>
                <Popover
                  content={<img src={t("demoImage")} className="demoImage" />}
                >
                  <Button type="primary" style={{ marginLeft: "20px" }}>
                    {t("demo")}
                  </Button>
                </Popover>
                <Link
                  href={t("linkValue")}
                  target="_blank"
                  style={{ marginLeft: "20px" }}
                >
                  <Button type="primary">{t("linkText")}</Button>
                </Link>
              </div>
            </div>
          </Header>
          <Layout>
            <>
              <LineageDag
                tables={this.state.tables.filter((table) => table.isExpand)}
                relations={this.state.relations}
                // @ts-ignore
                columns={this.columns}
                // @ts-ignore
                operator={this.operator}
                centerId={this.state.centerId}
                onLoaded={(canvas) => {
                  this.setState({
                    canvas,
                  });
                  this.changeSourceData();
                }}
                config={{
                  titleRender: (title, node) => {
                    return <>{title}</>;
                  },
                  minimap: {
                    enable: true,
                  },
                }}
                actionMenu={this.state.actionMenu}
              />
              <Modal
                visible={this.state.visible}
                onCancel={() => {
                  this.setState({
                    visible: false,
                  });
                }}
                onOk={() => {
                  this.confirmTable();
                }}
              >
                {this.getUpload()}
                {this.getSelect()}
              </Modal>
            </>
          </Layout>
        </Layout>
      </Router>
    );
  }
}

document.title = t("title");
ReactDOM.render(<Com />, document.getElementById("main"));
