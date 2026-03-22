import { Table, Tag, Select, message } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { ordersApi } from '../services/api';

const statusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '待付款', color: 'orange' },
  paid: { text: '已付款', color: 'blue' },
  processing: { text: '处理中', color: 'cyan' },
  shipped: { text: '已发货', color: 'geekblue' },
  delivered: { text: '已送达', color: 'green' },
  cancelled: { text: '已取消', color: 'default' },
  refunded: { text: '已退款', color: 'red' },
};

interface Order {
  id: number;
  order_no: string;
  user_id: number;
  status: string;
  total_amount: number;
  shipping_name?: string;
  created_at: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data: any = await ordersApi.list({ page, page_size: 20, status: statusFilter });
      setOrders(data.items || []);
      setTotal(data.total || 0);
    } catch {
      message.error('加载订单列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      message.success('状态更新成功');
      fetchOrders();
    } catch {
      message.error('状态更新失败');
    }
  };

  const columns: ColumnsType<Order> = [
    { title: '订单号', dataIndex: 'order_no', width: 180 },
    { title: '用户ID', dataIndex: 'user_id', width: 80 },
    { title: '收货人', dataIndex: 'shipping_name', width: 100, render: (v) => v || '-' },
    {
      title: '金额',
      dataIndex: 'total_amount',
      width: 120,
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => {
        const s = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '下单时间',
      dataIndex: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      width: 150,
      render: (_, record) => (
        <Select
          size="small"
          value={record.status}
          style={{ width: 110 }}
          options={Object.entries(statusMap).map(([k, v]) => ({ value: k, label: v.text }))}
          onChange={(value) => handleStatusChange(record.id, value)}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>订单管理</h2>
        <Select
          placeholder="筛选状态"
          allowClear
          style={{ width: 150 }}
          options={Object.entries(statusMap).map(([k, v]) => ({ value: k, label: v.text }))}
          onChange={(value) => { setStatusFilter(value); setPage(1); }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={orders}
        loading={loading}
        rowKey="id"
        pagination={{
          current: page,
          pageSize: 20,
          total,
          onChange: (p) => setPage(p),
          showTotal: (total) => `共 ${total} 条`,
        }}
        locale={{ emptyText: '暂无订单' }}
      />
    </div>
  );
}
