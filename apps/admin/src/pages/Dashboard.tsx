import { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Table, Tag, message } from 'antd';
import {
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { dashboardApi } from '../services/api';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    total_sales: 0,
    order_count: 0,
    product_count: 0,
    user_count: 0,
  });
  const [salesTrend, setSalesTrend] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getMetrics()
      .then((data: any) => {
        setMetrics(data.metrics);
        setSalesTrend(data.sales_trend);
        setRecentOrders(data.recent_orders);
      })
      .catch(() => message.error('加载统计数据失败'))
      .finally(() => setLoading(false));
  }, []);

  const orderColumns = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no' },
    { 
      title: '金额', 
      dataIndex: 'total_amount', 
      key: 'total_amount',
      render: (val: number) => `¥${val.toFixed(2)}`
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        const colors: any = {
          pending: 'orange', paid: 'blue', processing: 'cyan', 
          shipped: 'geekblue', delivered: 'green', cancelled: 'default'
        };
        const texts: any = {
          pending: '待付款', paid: '已付款', processing: '处理中', 
          shipped: '已发货', delivered: '已送达', cancelled: '已取消'
        };
        return <Tag color={colors[status] || 'default'}>{texts[status] || status}</Tag>;
      }
    },
    { 
      title: '时间', 
      dataIndex: 'created_at', 
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString('zh-CN')
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>数据看板</h2>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable loading={loading}>
            <Statistic
              title="总销售额 (已支付)"
              value={metrics.total_sales}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable loading={loading}>
            <Statistic
              title="有效订单数"
              value={metrics.order_count}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable loading={loading}>
            <Statistic
              title="商品总数"
              value={metrics.product_count}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable loading={loading}>
            <Statistic
              title="用户总数"
              value={metrics.user_count}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={14}>
          <Card title="近7天销售趋势" loading={loading} style={{ height: '100%' }}>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
                  <Line type="monotone" dataKey="sales" stroke="#1677ff" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="销售额" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="最近订单" loading={loading} style={{ height: '100%' }} bodyStyle={{ padding: 0 }}>
            <Table
              dataSource={recentOrders}
              columns={orderColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
