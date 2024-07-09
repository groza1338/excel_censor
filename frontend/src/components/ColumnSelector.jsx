import React, { useEffect, useRef } from 'react';
import { Checkbox } from 'antd';
import './ColumnSelector.css';

const ColumnSelector = ({ columns, selectedColumns, setSelectedColumns }) => {
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea.scrollHeight > scrollArea.clientHeight) {
      scrollArea.classList.add('has-scroll');
    } else {
      scrollArea.classList.remove('has-scroll');
    }
  }, [columns]);

  const onChange = (checkedValues) => {
    setSelectedColumns(checkedValues);
  };

  return (
    <div>
      <h3>Выберете колонки, которые хотите спрятать</h3>
      <Checkbox.Group onChange={onChange} value={selectedColumns}>
        <div className="scroll-area" ref={scrollAreaRef}>
          {columns.map((item, index) => (
            <div className="column-selector-item" key={index}>
              <Checkbox value={index}>{item}</Checkbox>
            </div>
          ))}
        </div>
      </Checkbox.Group>
    </div>
  );
};

export default ColumnSelector;
