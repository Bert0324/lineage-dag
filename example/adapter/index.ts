import type { ISourceData, ITargetData } from "../types";

export class Adapter {
    transfer(source: ISourceData): ITargetData {
        const data: Partial<ITargetData> = {};
        const keys = Object.keys(source);
        const cache: Record<string, ISourceData[number]> = {};
        data.tables = keys.map(key => {
            const columnKeys = Object.keys(source[key].columns);
            cache[source[key].table_name] = source[key];
            return {
                id: source[key].table_name,
                name: key,
                fields: columnKeys.map(columnKey => ({
                    name: columnKey,
                    title: ''
                })),
                isCollapse: false,
                isExpand: false
            };
        });
        data.relations = [];
        const relationKey: Record<string, boolean> = {};
        keys.map(key => {
            const item = source[key];
            const tgtTableId = source[key].table_name;
            Object.keys(item.columns).forEach(columnKey => {
                const columns = item.columns[columnKey];
                const tgtTableColName = columnKey;
                columns.forEach(column => {
                    const arr = column.split('.');
                    const srcTableColName = arr.pop();
                    const srcTableId = arr.join('.');
                    const k = `${srcTableId} ${tgtTableId} ${srcTableColName} ${tgtTableColName}`;
                    if (!relationKey[k]) {
                        relationKey[k] = true;
                        data.relations.push({
                            srcTableId,
                            tgtTableId,
                            srcTableColName,
                            tgtTableColName
                        });
                    }
                });
            });
        });
        return data as ITargetData;
    }
}