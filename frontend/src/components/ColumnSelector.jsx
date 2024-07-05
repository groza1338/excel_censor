import React from 'react';
import { Checkbox, List } from 'antd';

const ColumnSelector = ({ columns, selectedColumns, setSelectedColumns }) => {
  const onChange = (checkedValues) => {
    setSelectedColumns(checkedValues);
  };

  return (
    <div>
      <h3>Выберете колонки, которые хотите спрятать</h3>
      <Checkbox.Group onChange={onChange} value={selectedColumns}>
        <List
          dataSource={columns}
          renderItem={(item, index) => (
            <List.Item>
              <Checkbox value={index}>{item}</Checkbox>
            </List.Item>
          )}
        />
      </Checkbox.Group>
    </div>
  );
};

export default ColumnSelector;
