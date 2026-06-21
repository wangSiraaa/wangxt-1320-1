import React, { useRef } from 'react';
import { Button, Space, Popconfirm } from 'antd';
import { PrinterOutlined, ClearOutlined } from '@ant-design/icons';

interface PrintHeaderProps {
  onClear: () => void;
}

const PrintHeader: React.FC<PrintHeaderProps> = ({ onClear }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="no-print"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0',
        marginBottom: 12,
      }}
    >
      <h2 style={{ margin: 0 }}>🍽 学校食堂营养配餐看板</h2>
      <Space>
        <Button icon={<PrinterOutlined />} onClick={handlePrint}>
          打印周菜单
        </Button>
        <Popconfirm title="确定清空所有配餐？" onConfirm={onClear} okText="确定" cancelText="取消">
          <Button icon={<ClearOutlined />} danger>
            清空
          </Button>
        </Popconfirm>
      </Space>
    </div>
  );
};

export default PrintHeader;
