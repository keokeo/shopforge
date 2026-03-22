import { Table, Tag, Input, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useState, useEffect, useCallback } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { usersApi } from '../services/api';

interface Customer {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data: any = await usersApi.list({ page, page_size: 20, search: search || undefined });
      setCustomers(data.items || []);
      setTotal(data.total || 0);
    } catch {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const columns: ColumnsType<Customer> = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '用户名', dataIndex: 'username' },
    { title: '邮箱', dataIndex: 'email', ellipsis: true },
    { title: '姓名', dataIndex: 'full_name', render: (v) => v || '-' },
    { title: '手机', dataIndex: 'phone', render: (v) => v || '-' },
    {
      title: '角色',
      dataIndex: 'is_admin',
      width: 80,
      render: (admin: boolean) => (
        <Tag color={admin ? 'purple' : 'default'}>{admin ? '管理员' : '用户'}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      width: 80,
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? '正常' : '禁用'}</Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>用户管理</h2>
        <Input.Search
          placeholder="搜索用户名/邮箱"
          prefix={<SearchOutlined />}
          style={{ width: 250 }}
          onSearch={(value) => { setSearch(value); setPage(1); }}
          allowClear
        />
      </div>
      <Table
        columns={columns}
        dataSource={customers}
        loading={loading}
        rowKey="id"
        pagination={{
          current: page,
          pageSize: 20,
          total,
          onChange: (p) => setPage(p),
          showTotal: (total) => `共 ${total} 条`,
        }}
        locale={{ emptyText: '暂无用户' }}
      />
    </div>
  );
}
