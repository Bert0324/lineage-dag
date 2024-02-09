/**
 * target input data
 */
export interface ITargetData {
  tables: {
    id: string;
    name: string;
    fields: {
      name: string;
      title: string;
    }[];
    /**
     * columns visible
     */
    isCollapse?: boolean;
    /**
     * relations visible
     */
    isExpand?: boolean;
    /**
     * show all columns
     */
    isShowAllColumns?: boolean;
  }[];
  relations: {
    srcTableId: string;
    tgtTableId: string;
    srcTableColName: string;
    tgtTableColName: string;
  }[];
}

/**
 * source output data
 */
export interface ISourceData {
  /**
   * key: table id
   */
  [key: string]: {
    sql?: string;
    /**
     * table
     */
    tables: string[];
    columns: {
      /**
       * key: column id
       */
      [key: string]: string[];
    };
    table_name: string;
    plan?: Record<string, any>;
  };
}

export interface ISourceDataV2 {
  /**
   * key: table id
   */
  [key: string]: {
    sql?: string;
    /**
     * table
     */
    tables: string[];
    columns: {
      /**
       * key: column id
       */
      [key: string]: string[][];
    };
    table_name: string;
    plan?: Record<string, any>;
  };
}

export interface IAdapter {
  transfer(source: any): ITargetData;
}
